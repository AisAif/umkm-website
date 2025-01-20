import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import axios from 'axios'
import fs from 'node:fs/promises'
import drive from '@adonisjs/drive/services/main'
import YAML from 'yaml'
import BotModel from '#models/bot_model'
import Message from '#models/message'
import AdmZip from 'adm-zip'
import Intent from '#models/intent'
import Response from '#models/response'
import Rule from '#models/rule'
import Story from '#models/story'
import { IncomingMessage } from 'node:http'
import { Readable } from 'node:stream'
import { addResponseValidator, editResponseValidator } from '#validators/response'
import { addDatasetValidator, editDatasetValidator } from '#validators/dataset'
import { addStoryValidator, editStoryValidator } from '#validators/story'
import { addRuleValidator, editRuleValidator } from '#validators/rule'
import { sendMessageValidator } from '#validators/message'

export default class BotsController {
  private client = axios.create({
    baseURL: `http://${env.get('NODE_ENV') === 'development' ? 'localhost' : 'rasa'}:${env.get('RASA_PORT')}/`,
    params: { token: env.get('RASA_SECRET') },
  })

  private ignoredSenderNames = env.get('IGNORED_SENDER_NAMES')?.split(',') ?? []

  public async sendMessage({ session, request, response }: HttpContext) {
    const payload = await request.validateUsing(sendMessageValidator)
    try {
      const result = await this.client.post('/webhooks/rest/webhook', {
        sender: payload.sender,
        message: payload.message,
      })

      if (result.data[0].text === env.get('RASA_DEFAULT_ANSWER')) {
        await Message.create({
          content: payload.message,
        })
      }
      session.flash('message', {
        type: 'success',
        text: result.data[0].text,
      })
    } catch (error) {
      session.flash('message', {
        type: 'error',
        text: 'Failed to send message',
      })
    }
    return response.redirect().back()
  }

  public async index({ inertia, request }: HttpContext) {
    const models = await BotModel.query()
      .orderBy('created_at', 'desc')
      .paginate(request.input('page', 1), 10)
    return inertia.render('dashboard/bot/model/index', { models })
  }

  public async trainModel({ response, session }: HttpContext) {
    const intents = await Intent.query().preload('messages').orderBy('name', 'asc')
    const responses = await Response.query().orderBy('name', 'asc')
    const rules = await Rule.query()
      .preload('steps', (query) => query.preload('response').preload('intent'))
      .orderBy('name', 'asc')
    const stories = await Story.query()
      .preload('steps', (query) => query.preload('response').preload('intent'))
      .orderBy('name', 'asc')
    const payload = {
      pipeline: [
        {
          name: 'WhitespaceTokenizer',
        },
        {
          name: 'RegexFeaturizer',
        },
        {
          name: 'LexicalSyntacticFeaturizer',
        },
        {
          name: 'CountVectorsFeaturizer',
        },
        {
          name: 'CountVectorsFeaturizer',
          analyzer: 'char_wb',
          min_ngram: 1,
          max_ngram: 4,
        },
        {
          name: 'DIETClassifier',
          epochs: 100,
        },
        {
          name: 'EntitySynonymMapper',
        },
        {
          name: 'ResponseSelector',
          epochs: 100,
        },
        {
          name: 'FallbackClassifier',
          threshold: 0.7,
        },
      ],
      policies: [
        {
          name: 'RulePolicy',
          core_fallback_threshold: 0.7,
          core_fallback_action_name: 'action_default_fallback',
          enable_fallback_prediction: true,
        },
      ],
      intents: [...intents.map((intent) => intent.name), 'nlu_fallback'],
      // entities: [],
      // slots: [],
      actions: ['action_default_fallback'],
      // forms: [],
      // e2e_actions: [],
      responses: responses.reduce(
        (acc, item) => ({ ...acc, [`utter_${item.name}`]: [{ text: item.content }] }),
        {
          utter_default: [{ text: env.get('RASA_DEFAULT_ANSWER') }],
        }
      ),
      // session_config: {
      //   session_expiration_time: 60,
      //   carry_over_slots_to_new_session: true,
      // },
      nlu: intents.map((intent) => ({
        intent: intent.name,
        examples: intent.messages.reduce(
          (acc, message) => (acc !== '' ? `${acc}\n- ${message.content}` : `- ${message.content}`),
          ''
        ),
      })),
      rules: [
        ...rules.map((rule) => ({
          rule: rule.name,
          steps: rule.steps.flatMap((step) => [
            {
              intent: step.intent?.name,
            },
            {
              action: `utter_${step.response.name}`,
            },
          ]),
        })),
        {
          rule: 'Activate fallback response',
          steps: [
            {
              intent: 'nlu_fallback',
            },
            {
              action: 'utter_default',
            },
          ],
        },
      ],
      stories: stories.map((story) => ({
        story: story.name,
        steps: story.steps.flatMap((step) => [
          {
            intent: step.intent?.name,
          },
          {
            action: `utter_${step.response.name}`,
          },
        ]),
      })),
    }
    console.log({ payload: YAML.stringify(payload) })
    const result = await this.client.post<IncomingMessage>(
      '/model/train',
      YAML.stringify(payload),
      {
        responseType: 'stream',
      }
    )

    const chunks: Buffer[] = []
    let contentLength = 0

    result.data.on('data', (chunk) => {
      chunks.push(chunk)
      contentLength += chunk.length
    })

    result.data.on('end', async () => {
      console.log('model trained, saving model...')
      const fileBuffer = Buffer.concat(chunks)
      const readableStream = new Readable({
        read() {
          this.push(fileBuffer)
          this.push(null)
        },
      })
      await drive
        .use('s3')
        .putStream(`${env.get('NODE_ENV')}/${result.headers.filename}`, readableStream, {
          contentLength,
        })
      console.log('model saved')

      await BotModel.create({
        name: result.headers.filename,
        isActive: false,
      })
    })

    session.flash('message', {
      type: 'success',
      text: 'Model berhasil di train',
    })

    return response.redirect().toRoute('bot.model.index')
  }

  public async activate({ request, response, session }: HttpContext) {
    const model = await BotModel.findOrFail(request.param('id'))
    try {
      const result = await this.client.put('/model', {
        model_server: {
          url: `${env.get('S3_ENDPOINT').replace(/\/$/, '')}/${env.get('S3_BUCKET')}/${env.get('NODE_ENV')}/${model.name}`,
          wait_time_between_pulls: 0,
        },
      })

      if (result.status >= 300) {
        session.flash('message', {
          type: 'error',
          text: 'Model gagal diaktifkan',
        })
        return response.redirect().toRoute('bot.model.index')
      }

      await BotModel.query().where('id', '!=', model.id).update({ isActive: false })
      model.isActive = true
      await model.save()
    } catch (error) {
      session.flash('message', {
        type: 'error',
        text: 'Model gagal diaktifkan',
      })
      return response.redirect().toRoute('bot.model.index')
    }

    session.flash('message', {
      type: 'success',
      text: 'Model berhasil diaktifkan',
    })
    return response.redirect().toRoute('bot.model.index')
  }

  public async addIntent({ session, request, response }: HttpContext) {
    const name: string = request.input('name')
    if (!name || name === '') {
      session.flash('message', {
        type: 'error',
        text: 'Intent name is required',
      })
      return response.redirect().toRoute('bot.dataset.index')
    }

    const existIntent = await Intent.query().where('name', name)
    if (existIntent.length > 0) {
      session.flash('message', {
        type: 'error',
        text: 'Intent is already exist',
      })
      return response.redirect().toRoute('bot.dataset.index')
    }

    await Intent.create({
      name,
    })

    session.flash('message', {
      type: 'success',
      text: 'Intent successfully added',
    })
    return response.redirect().toRoute('bot.dataset.index')
  }

  public async deleteIntent({ session, request, response }: HttpContext) {
    const existIntent = await Intent.find(request.param('id'))
    if (!existIntent) {
      session.flash('message', {
        type: 'error',
        text: 'Intent not found',
      })
      return response.redirect().toRoute('bot.dataset.index')
    }

    await existIntent.delete()

    session.flash('message', {
      type: 'success',
      text: 'Intent successfully deleted',
    })
    return response.redirect().toRoute('bot.dataset.index')
  }

  public async addMessageToIntent({ session, request, response }: HttpContext) {
    const messageId = request.param('message_id')
    const intentId = request.param('id')

    try {
      const message = await Message.find(messageId)
      const intent = await Intent.find(intentId)
      if (!intent || !message) {
        session.flash('message', {
          type: 'error',
          text: 'Intent or message not found',
        })
        return response.redirect().toRoute('bot.dataset.index')
      }

      await message.related('intent').associate(intent)

      session.flash('message', {
        type: 'success',
        text: 'Message successfully added to intent',
      })
      return response.redirect().toRoute('bot.dataset.index')
    } catch (error) {
      session.flash('message', {
        type: 'error',
        text: 'Failed to add message to intent',
      })
      return response.redirect().toRoute('bot.dataset.index')
    }
  }

  public async getDataset({ inertia, request }: HttpContext) {
    const type = request.input('type', 'all')
    const search = request.input('search')
    const datasets = await Message.query()
      .where((query) => {
        if (type === 'labeled') {
          return query.whereNotNull('intent_id')
        } else if (type === 'unlabeled') {
          return query.whereNull('intent_id')
        }
        return
      })
      .where((query) => {
        if (search) {
          return query.where('content', 'like', `%${search}%`)
        }
        return
      })
      .orderBy('created_at', 'desc')
      .preload('intent')
      .paginate(request.input('page', 1), 10)

    const intents = await Intent.query().orderBy('name', 'asc')

    return inertia.render('dashboard/bot/dataset/index', { datasets, intents })
  }

  public async addDataset({ session, request, response }: HttpContext) {
    const payload = await request.validateUsing(addDatasetValidator)

    await Message.create(payload)

    session.flash('message', {
      type: 'success',
      text: 'Dataset successfully added',
    })

    return response.redirect().toRoute('bot.dataset.index')
  }

  public async addDatasetViaFile({ session, request, response }: HttpContext) {
    const files = request.files('files', { extnames: ['zip'] })
    const existingContents = new Set(
      await Message.query()
        .select('content')
        .then((rows) => rows.map((row) => row.content))
    )

    try {
      const file = await fs.readFile(files[0].tmpPath!)

      const zip = new AdmZip(file)
      zip.getEntries().forEach(async (entry) => {
        if (entry.name === 'message_1.json') {
          const content = zip.readAsText(entry)

          const json: { messages: { sender_name: string; content?: string }[] } =
            await JSON.parse(content)
          const messages = json.messages
            .map((message) => {
              if (this.ignoredSenderNames.includes(message.sender_name) || !message.content)
                return null

              if (message.content.length > 255) {
                console.warn(`Message too long: ${message.content}`)
                return null
              }

              return {
                content: message.content,
              }
            })
            .filter((value) => value !== null)
            .filter((message) => !existingContents.has(message.content))
          const createdMessages = await Message.createMany(messages)

          createdMessages.forEach(async (message) => {
            existingContents.add(message.content)
          })
        }
      })

      session.flash('message', {
        type: 'success',
        text: 'Dataset berhasil ditambahkan',
      })
      return response.redirect().toRoute('bot.dataset.index')
    } catch (error) {
      console.log(error)
      session.flash('message', {
        type: 'error',
        text: 'Dataset gagal ditambahkan',
      })

      return response.redirect().toRoute('bot.dataset.index')
    }
  }

  public async editDataset({ session, request, response }: HttpContext) {
    const payload = await request.validateUsing(editDatasetValidator)
    const id = request.param('id')

    const existMessage = await Message.find(id)
    if (!existMessage) {
      session.flash('message', {
        type: 'error',
        text: 'Message not found',
      })
      return response.redirect().toRoute('bot.dataset.index')
    }

    await existMessage.merge(payload).save()

    session.flash('message', {
      type: 'success',
      text: 'Dataset successfully updated',
    })

    return response.redirect().toRoute('bot.dataset.index')
  }

  public async deleteDataset({ session, request, response }: HttpContext) {
    const id = request.param('id')
    const existMessage = await Message.find(id)
    if (!existMessage) {
      session.flash('message', {
        type: 'error',
        text: 'Message not found',
      })
      return response.redirect().toRoute('bot.dataset.index')
    }

    await existMessage.delete()

    session.flash('message', {
      type: 'success',
      text: 'Message successfully deleted',
    })
    return response.redirect().toRoute('bot.dataset.index')
  }

  public async getResponse({ inertia, request }: HttpContext) {
    const search = request.input('search')
    const responses = await Response.query()

      .where((query) => {
        if (search) {
          return query
            .where('content', 'like', `%${search}%`)
            .orWhere('name', 'like', `%${search}%`)
        }
        return
      })
      .orderBy('created_at', 'desc')
      .paginate(request.input('page', 1), 10)

    return inertia.render('dashboard/bot/response/index', { responses })
  }

  public async addResponse({ session, request, response }: HttpContext) {
    const payload = await request.validateUsing(addResponseValidator)

    const existResponse = await Response.query().where('name', payload.name)
    if (existResponse.length > 0) {
      session.flash('message', {
        type: 'error',
        text: 'Response name already exists',
      })
      return response.redirect().toRoute('bot.response.index')
    }

    const responseModel = new Response()
    responseModel.name = payload.name
    responseModel.content = payload.content
    await responseModel.save()

    session.flash('message', {
      type: 'success',
      text: 'Response added',
    })
    return response.redirect().toRoute('bot.response.index')
  }

  public async editResponse({ session, request, response }: HttpContext) {
    const payload = await request.validateUsing(editResponseValidator)

    const id = request.param('id')

    let existResponse = await Response.query()
      .where('name', payload.name)
      .whereNot('id', id)
      .first()
    if (existResponse) {
      session.flash('message', {
        type: 'error',
        text: 'Response name already exists',
      })
      return response.redirect().toRoute('bot.response.index')
    }

    existResponse = await Response.find(id)
    if (!existResponse) {
      session.flash('message', {
        type: 'error',
        text: 'Response not found',
      })
      return response.redirect().toRoute('bot.response.index')
    }

    existResponse.name = payload.name
    existResponse.content = payload.content
    await existResponse.save()

    session.flash('message', {
      type: 'success',
      text: 'Response updated',
    })
    return response.redirect().toRoute('bot.response.index')
  }

  public async deleteResponse({ session, request, response }: HttpContext) {
    const id = request.param('id')
    const existResponse = await Response.find(id)
    if (!existResponse) {
      session.flash('message', {
        type: 'error',
        text: 'Response not found',
      })
      return response.redirect().toRoute('bot.response.index')
    }

    await existResponse.delete()

    session.flash('message', {
      type: 'success',
      text: 'Response deleted',
    })
    return response.redirect().toRoute('bot.response.index')
  }

  public async getStory({ inertia, request }: HttpContext) {
    const stories = await Story.query()
      .preload('steps', (query) => query.preload('response').preload('intent'))
      .where((query) => {
        if (request.input('search')) {
          return query.where('name', 'like', `%${request.input('search')}%`)
        }
      })
      .orderBy('created_at', 'desc')
      .paginate(request.input('page', 1), 10)
    const intents = await Intent.query().orderBy('name', 'asc')
    const responses = await Response.query().orderBy('name', 'asc')
    return inertia.render('dashboard/bot/story/index', { stories, intents, responses })
  }

  public async addStory({ session, request, response }: HttpContext) {
    const payload = await request.validateUsing(addStoryValidator)

    const existStory = await Story.query().where('name', payload.name).first()
    if (existStory) {
      session.flash('message', {
        type: 'error',
        text: 'Story name already exists',
      })
      return response.redirect().toRoute('bot.story.index')
    }

    const story = new Story()
    story.name = payload.name
    await story.save()
    await story.related('steps').createMany(payload.steps)

    session.flash('message', {
      type: 'success',
      text: 'Story added',
    })
    return response.redirect().toRoute('bot.story.index')
  }

  public async editStory({ session, request, response }: HttpContext) {
    const payload = await request.validateUsing(editStoryValidator)
    const id = request.param('id')

    let existStory = await Story.query().where('name', payload.name).where('id', '!=', id).first()
    if (existStory) {
      session.flash('message', {
        type: 'error',
        text: 'Story name already exists',
      })
      return response.redirect().toRoute('bot.story.index')
    }

    existStory = await Story.find(id)
    if (!existStory) {
      session.flash('message', {
        type: 'error',
        text: 'Story not found',
      })
      return response.redirect().toRoute('bot.story.index')
    }

    existStory.name = payload.name
    await existStory.related('steps').query().delete()
    await existStory.related('steps').createMany(payload.steps)
    await existStory.save()

    session.flash('message', {
      type: 'success',
      text: 'Story updated',
    })
    return response.redirect().toRoute('bot.story.index')
  }

  public async deleteStory({ session, request, response }: HttpContext) {
    const id = request.param('id')
    const existStory = await Story.find(id)
    if (!existStory) {
      session.flash('message', {
        type: 'error',
        text: 'Story not found',
      })
      return response.redirect().toRoute('bot.story.index')
    }

    await existStory.delete()

    session.flash('message', {
      type: 'success',
      text: 'Story deleted',
    })
    return response.redirect().toRoute('bot.story.index')
  }

  public async getRule({ inertia, request }: HttpContext) {
    const rules = await Rule.query()
      .preload('steps', (query) => query.preload('response').preload('intent'))
      .where((query) => {
        if (request.input('search')) {
          return query.where('name', 'like', `%${request.input('search')}%`)
        }
      })
      .orderBy('created_at', 'desc')
      .paginate(request.input('page', 1), 10)
    const intents = await Intent.query().orderBy('name', 'asc')
    const responses = await Response.query().orderBy('name', 'asc')
    return inertia.render('dashboard/bot/rule/index', { rules, intents, responses })
  }

  public async addRule({ session, request, response }: HttpContext) {
    const payload = await request.validateUsing(addRuleValidator)

    const existRule = await Rule.query().where('name', payload.name).first()
    if (existRule) {
      session.flash('message', {
        type: 'error',
        text: 'Rule name already exists',
      })
      return response.redirect().toRoute('bot.rule.index')
    }

    const rule = new Rule()
    rule.name = payload.name
    await rule.save()
    await rule.related('steps').createMany(payload.steps)

    session.flash('message', {
      type: 'success',
      text: 'Rule added',
    })
    return response.redirect().toRoute('bot.rule.index')
  }

  public async editRule({ session, request, response }: HttpContext) {
    const payload = await request.validateUsing(editRuleValidator)
    const id = request.param('id')

    let existRule = await Rule.query().where('name', payload.name).where('id', '!=', id).first()
    if (existRule) {
      session.flash('message', {
        type: 'error',
        text: 'Rule name already exists',
      })
      return response.redirect().toRoute('bot.rule.index')
    }

    existRule = await Rule.find(id)
    if (!existRule) {
      session.flash('message', {
        type: 'error',
        text: 'Rule not found',
      })
      return response.redirect().toRoute('bot.rule.index')
    }

    existRule.name = payload.name
    await existRule.related('steps').query().delete()
    await existRule.related('steps').createMany(payload.steps)
    await existRule.save()

    session.flash('message', {
      type: 'success',
      text: 'Rule updated',
    })
    return response.redirect().toRoute('bot.rule.index')
  }

  public async deleteRule({ session, request, response }: HttpContext) {
    const id = request.param('id')
    const existRule = await Rule.find(id)
    if (!existRule) {
      session.flash('message', {
        type: 'error',
        text: 'Rule not found',
      })
      return response.redirect().toRoute('bot.rule.index')
    }

    await existRule.delete()

    session.flash('message', {
      type: 'success',
      text: 'Rule deleted',
    })
    return response.redirect().toRoute('bot.rule.index')
  }
}
