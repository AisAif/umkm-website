import Message from '#models/message'
import env from '#start/env'
import axios from 'axios'
import drive from '@adonisjs/drive/services/main'
import YAML from 'yaml'
import { IncomingMessage } from 'node:http'
import { Readable } from 'node:stream'
import BotModel from '#models/bot_model'
import Intent from '#models/intent'
import Response from '#models/response'
import Rule from '#models/rule'
import Story from '#models/story'

class BotService {
  private client = axios.create({
    baseURL: `http://${env.get('NODE_ENV') === 'development' ? 'localhost' : 'rasa'}:${env.get('RASA_PORT')}/`,
    params: { token: env.get('RASA_SECRET') },
  })

  public providers = [
    {
      name: 'sinch',
      isActive: false,
    },
    {
      name: 'facebook',
      isActive: false,
    },
  ]

  public status: {
    onProcess: boolean
    processValue?: number
    success?: boolean
    name?: 'train' | 'deploy'
  } = {
    onProcess: false,
  }

  public async trainModel() {
    if (this.status.name === 'train' && this.status.onProcess) {
      console.log('Already training')
      return
    }

    this.status = {
      onProcess: true,
      processValue: 0,
      name: 'train',
    }

    try {
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
            (acc, message) =>
              acc !== '' ? `${acc}\n- ${message.content}` : `- ${message.content}`,
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

      this.status = {
        onProcess: true,
        processValue: 30,
        name: 'train',
      }

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

        await BotModel.query().update({ isActive: false })
        await BotModel.create({
          name: result.headers.filename,
          isActive: true,
        })
      })
      this.status = {
        onProcess: true,
        processValue: 80,
        name: 'train',
      }
    } catch (error) {
      console.log(error)

      this.status = {
        name: 'train',
        onProcess: false,
        processValue: undefined,
        success: false,
      }
    }

    this.status = {
      name: 'train',
      onProcess: false,
      processValue: undefined,
      success: true,
    }
  }

  public async activateModel(id: number) {
    if (this.status.name === 'deploy' && this.status.onProcess) {
      console.log('Model is under activating')
      return
    }

    try {
      this.status = {
        onProcess: true,
        processValue: 20,
        success: undefined,
        name: 'deploy',
      }
      const model = await BotModel.findOrFail(id)
      const result = await this.client.put('/model', {
        model_server: {
          url: `${env.get('S3_ENDPOINT').replace(/\/$/, '')}/${env.get('S3_BUCKET')}/${env.get('NODE_ENV')}/${model.name}`,
          wait_time_between_pulls: 0,
        },
      })

      this.status = {
        onProcess: true,
        processValue: 60,
        success: undefined,
        name: 'deploy',
      }

      if (result.status >= 300) {
        throw new Error(`Something went wrong, status code: ${result.status}`)
      }

      await BotModel.query().where('id', '!=', model.id).update({ isActive: false })
      model.isActive = true
      await model.save()
    } catch (error) {
      console.log(error)

      this.status = {
        name: 'deploy',
        onProcess: false,
        processValue: undefined,
        success: false,
      }
    }

    this.status = {
      onProcess: false,
      processValue: undefined,
      success: true,
      name: 'deploy',
    }
  }

  public toggleActivate({ name, isActive }: { name: string; isActive: boolean }) {
    const provider = this.providers.find((prov) => prov.name === name)
    if (provider) {
      provider.isActive = isActive
    }
  }

  public async sendMessage({ sender, message }: { sender: string; message: string }) {
    const result = await this.client.post('/webhooks/rest/webhook', {
      sender: sender,
      message: message,
    })

    if (result.data[0].text === env.get('RASA_DEFAULT_ANSWER')) {
      await Message.create({
        content: message,
      })
    }

    return result
  }
}

export default new BotService()
