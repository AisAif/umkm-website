import type { HttpContext } from '@adonisjs/core/http'
import BotModel from '#models/bot_model'
import Message from '#models/message'
import Intent from '#models/intent'
import Response from '#models/response'
import Rule from '#models/rule'
import Story from '#models/story'
import { addResponseValidator, editResponseValidator } from '#validators/response'
import { addDatasetValidator, editDatasetValidator } from '#validators/dataset'
import { addStoryValidator, editStoryValidator } from '#validators/story'
import { addRuleValidator, editRuleValidator } from '#validators/rule'
import { sendMessageValidator } from '#validators/message'
import BotService from '#services/bot_service'
import RasaWebhookService from '#services/rasa_webhook_service'
import fs from 'node:fs/promises'
import db from '@adonisjs/lucid/services/db'
// import App from '@adonisjs/core/services/app'
// import path from 'node:path'
// import fs from 'node:fs'

export default class BotsController {
  public async webhook({ request, response }: HttpContext) {
    return response.json(await RasaWebhookService.webhook(request.body().tracker))
  }

  public async sendMessage({ session, request, response }: HttpContext) {
    const payload = await request.validateUsing(sendMessageValidator)
    try {
      const result = await BotService.sendMessage({
        message: payload.message,
        sender: payload.sender,
      })

      const messages = [
        {
          type: 'success',
          text: result,
        },
      ]

      if (Math.random() < 0.4) {
        const suggestion = await BotService.getSuggestion()
        messages.push({
          type: 'info',
          text: suggestion,
        })
      } else {
        const uatMessage = await BotService.getUAT()
        if (Math.random() < 0.6 && uatMessage) {
          messages.push({
            type: 'info',
            text: uatMessage,
          })
        }
      }
      // console.log(messages)
      session.flash('messages', messages)
    } catch (error) {
      session.flash('messages', [
        {
          type: 'error',
          text: 'Failed to send message',
        },
      ])
    }
    return response.redirect().back()
  }

  public async index({ inertia, request }: HttpContext) {
    const models = await BotModel.query()
      .orderBy('created_at', 'desc')
      .paginate(request.input('page', 1), 10)
    return inertia.render('dashboard/bot/model/index', { models })
  }

  public async getIntegration({ inertia }: HttpContext) {
    const providers = BotService.providers
    return inertia.render('dashboard/bot/integration/index', { providers })
  }

  public async toggleActivate({ session, request, response }: HttpContext) {
    ;(request.input('providers') as { name: string; isActive: boolean }[]).forEach(
      ({ name, isActive }) => {
        console.log({ name, isActive })
        BotService.toggleActivate({ name, isActive })
      }
    )

    session.flash('message', {
      type: 'success',
      text: 'Provider toggled',
    })

    return response.redirect().toRoute('bot.integration.index')
  }

  public async trainModel({ response }: HttpContext) {
    BotService.trainModel()

    return response.redirect().toRoute('bot.model.index')
  }

  public async evaluation({ response, inertia, request, session }: HttpContext) {
    const name = request.param('name')
    const data = await BotService.getEvaluation(name)
    if (data) {
      return inertia.render('dashboard/bot/model/evaluation/index', { data })
    }
    session.flash('message', {
      type: 'error',
      text: 'Model evaluation data not found',
    })
    return response.redirect().toRoute('bot.model.index')
  }

  public async status({ response }: HttpContext) {
    const status = BotService.status
    if (status.name && !status.onProcess) {
      BotService.status = {
        onProcess: false,
        processValue: undefined,
        success: undefined,
        name: undefined,
      }
    }
    return response.json(status)
  }

  public async activate({ request, response }: HttpContext) {
    BotService.activateModel(request.param('id'))

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

    const referer = request.headers().referer
    if (referer) {
      const url = new URL(referer)
      console.log(url)
      return response.redirect(url.toString())
    }

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

    // // Dissociate all related messages
    // const messages = await existIntent.related('messages').query()
    // for (const message of messages) {
    //   await message.related('intent').dissociate()
    //   await message.save()
    // }

    // Hapus intent (pastikan delete tidak silently fail)
    try {
      await existIntent.delete()
    } catch (error) {
      console.error('Gagal menghapus intent:', error)
    }

    session.flash('message', {
      type: 'success',
      text: 'Intent successfully deleted',
    })

    const referer = request.headers().referer
    if (referer) {
      const url = new URL(referer)
      console.log(url)
      return response.redirect(url.toString())
    }

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
    } catch (error) {
      session.flash('message', {
        type: 'error',
        text: 'Failed to add message to intent',
      })
    }

    const referer = request.headers().referer
    if (referer) {
      const url = new URL(referer)
      console.log(url)
      return response.redirect(url.toString())
    }

    return response.redirect().toRoute('bot.dataset.index')
  }

  public async addDatasetViaJson({ session, request, response }: HttpContext) {
    const files = request.files('files', { extnames: ['json'] })
    const file = await fs.readFile(files[0].tmpPath!)

    const messages: { content: string; intent: string }[] = JSON.parse(file.toString())
    for (const message of messages) {
      await db.transaction(async (trx) => {
        console.log(message)
        if (
          !message.content ||
          !message.intent ||
          message.content === '' ||
          message.intent === ''
        ) {
          return
        }

        let existIntent = await Intent.query({ client: trx }).where('name', message.intent).first()
        if (!existIntent) {
          console.log(`intent ${message.intent} not found, creating...`)
          existIntent = new Intent()
          existIntent.name = message.intent
          existIntent.useTransaction(trx)
          await existIntent.save()
        }

        let existMessage = await Message.query({ client: trx })
          .where('content', message.content)
          .first()
        if (!existMessage) {
          console.log(`message ${message.content} not found, creating...`)
          existMessage = new Message()
          existMessage.content = message.content
          existMessage.useTransaction(trx)
          await existMessage.save()
        }

        await existMessage.related('intent').associate(existIntent)
      })
    }

    session.flash('message', {
      type: 'success',
      text: 'Dataset successfully added',
    })

    return response.redirect().toRoute('bot.dataset.index')
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
      .where((query) => {
        if (request.input('intent_id') && request.input('intent_id') !== 'all') {
          return query.where('intent_id', request.input('intent_id'))
        }
        return
      })
      .orderBy('created_at', 'desc')
      .preload('intent')
      .paginate(request.input('page', 1), 10)

    const intents = await Intent.query().orderBy('name', 'asc')

    return inertia.render('dashboard/bot/dataset/index', { datasets, intents })
  }

  public async optimizeDataset({ request, response }: HttpContext) {
    BotService.optimizeDataset()

    const referer = request.headers().referer
    if (referer) {
      const url = new URL(referer)
      console.log(url)
      return response.redirect(url.toString())
    }

    return response.redirect().toRoute('bot.dataset.index')
  }

  public async exportDataset({ request, response }: HttpContext) {
    const total = request.input('total') || 100
    const datasets = await Message.query()
      .where((query) => {
        return query.whereNull('intent_id')
      })
      .orderBy('created_at', 'desc')
      .preload('intent')
      .limit(total)

    // create json
    const data = datasets.map((dataset) => {
      return {
        content: dataset.content,
        intent: dataset.intent?.name,
      }
    })

    const fileName = `dataset-${Date.now()}.json`
    const jsonBuffer = Buffer.from(JSON.stringify(data, null, 2), 'utf-8')

    response.header('Content-Type', 'application/json')
    response.header('Content-Disposition', `attachment; filename="${fileName}"`)
    return response.send(jsonBuffer)
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

  public async addDatasetViaFile({ request, response, session }: HttpContext) {
    try {
      const files = request.files('files', { extnames: ['zip'] })

      BotService.addDataset(files[0])
    } catch (error) {
      console.log(error)
      session.flash('message', {
        type: 'error',
        text: 'Failed to add dataset',
      })
    }
    return response.redirect().toRoute('bot.dataset.index')
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

    const referer = request.headers().referer
    if (referer) {
      const url = new URL(referer)
      console.log(url)
      return response.redirect(url.toString())
    }

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

    const referer = request.headers().referer
    if (referer) {
      const url = new URL(referer)
      console.log(url)
      return response.redirect(url.toString())
    }

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
