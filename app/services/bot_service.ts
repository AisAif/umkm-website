import Message from '#models/message'
import env from '#start/env'
import axios from 'axios'
import drive from '@adonisjs/drive/services/main'
import YAML from 'yaml'
import { IncomingMessage } from 'node:http'
import { Readable } from 'node:stream'
import AdmZip from 'adm-zip'
import fs from 'node:fs/promises'
import BotModel from '#models/bot_model'
import Intent from '#models/intent'
import Response from '#models/response'
import Rule from '#models/rule'
import Story from '#models/story'
import { MultipartFile } from '@adonisjs/bodyparser'
import rasaConfig from '#config/rasa'
import Product from '#models/product'
import Tag from '#models/tag'

class BotService {
  private ignoredSenderNames = env.get('IGNORED_SENDER_NAMES')?.split(',') ?? []

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
    name?: string
    message?: string
  } = {
    onProcess: false,
  }

  private rasaConfigDefault = rasaConfig({
    product_name: [],
    tag_name: [],
  })

  private initRasaConfig() {
    Promise.all([Product.all(), Tag.all()]).then(([products, tags]) => {
      this.rasaConfigDefault = rasaConfig({
        product_name: products.map((product) => product.name),
        tag_name: tags.map((tag) => tag.name),
      })
    })
  }

  // public defaultCustomActions = ['action_ask_product', 'action_ask_vehicle_model']
  // public defaultSlots = {
  //   product_name: {
  //     type: 'text',
  //     mappings: [
  //       {
  //         type: 'from_entity',
  //         entity: 'product_name',
  //       },
  //       {
  //         type: 'from_text',
  //       },
  //     ],
  //   },
  //   vehicle_name: {
  //     type: 'text',
  //     mappings: [
  //       {
  //         type: 'from_entity',
  //         entity: 'vehicle_name',
  //       },
  //       {
  //         type: 'from_text',
  //       },
  //     ],
  //   },
  // }
  // public defaultIntents = [
  //   {
  //     intent: 'ask_product',
  //     examples: [
  //       'Ada [Matrix](product_name)?',
  //       'Gadah [Bi Led](product_name)?',
  //       'Mau pasang [AES](product_name)',
  //       'Spesifikasi [LED](product_name)',
  //       '[Laser](product_name) masih ada?',
  //     ],
  //   },
  //   {
  //     intent: 'ask_vehicle_model',
  //     examples: [
  //       'Untuk mobil [Honda](vehicle_name)?',
  //       'Untuk motor [Yamaha](vehicle_name)?',
  //       'Mau pasang untuk [Suzuki](vehicle_name)?',
  //       '[Vespa](vehicle_name) ada billed apa?',
  //     ],
  //   },
  // ]
  // public defaultRules = [
  //   {
  //     rule: 'Tanya Produk',
  //     steps: [
  //       {
  //         intent: 'ask_product',
  //       },
  //       {
  //         action: 'action_ask_product',
  //       },
  //     ],
  //   },
  //   {
  //     rule: 'Tanya Kendaraan',
  //     steps: [
  //       {
  //         intent: 'ask_vehicle_model',
  //       },
  //       {
  //         action: 'action_ask_vehicle_model',
  //       },
  //     ],
  //   },
  // ]

  public async addDataset(rawFile: MultipartFile) {
    if (!rawFile || this.status.onProcess) return
    this.status = {
      onProcess: true,
      name: 'addDataset',
      processValue: 0,
      message: 'Adding dataset',
    }

    const queryResult = await Message.query().select('content')
    const existingContents = new Set(queryResult.map((row) => row.content))

    this.status.processValue = 20

    try {
      const file = await fs.readFile(rawFile.tmpPath!)
      const zip = new AdmZip(file)
      const entries = zip.getEntries()

      this.status.processValue = 40

      for (let index = 0; index < entries.length; index++) {
        const entry = entries[index]

        if (entry.name === 'message_1.json') {
          const content = zip.readAsText(entry)
          const json: { messages: { sender_name: string; content?: string }[] } =
            JSON.parse(content)

          const messages = json.messages
            .map((message) => {
              if (this.ignoredSenderNames.includes(message.sender_name) || !message.content)
                return null

              if (message.content.length > 255) {
                console.warn(`Message too long: ${message.content}`)
                return null
              }

              return { content: message.content }
            })
            .filter((value) => value !== null)
            .filter((message) => !existingContents.has(message!.content))

          const createdMessages = await Message.createMany(messages)
          createdMessages.forEach((message) => existingContents.add(message.content))
        }

        this.status.processValue = 40 + ((index + 1) / entries.length) * 60
      }
    } catch (error) {
      console.log(error)
      this.status = {
        onProcess: false,
        name: 'addDataset',
        success: false,
        processValue: undefined,
      }
      return
    }

    this.status = {
      onProcess: false,
      name: 'addDataset',
      success: true,
      processValue: undefined,
    }
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
      message: 'Training model',
    }

    this.initRasaConfig()

    try {
      const intents = await Intent.query()
        .preload('messages')
        .orderBy('name', 'asc')
        .where('name', '!=', 'unknown')
      const responses = await Response.query().orderBy('name', 'asc')
      const rules = await Rule.query()
        .preload('steps', (query) => query.preload('response').preload('intent'))
        .orderBy('name', 'asc')
      const stories = await Story.query()
        .preload('steps', (query) => query.preload('response').preload('intent'))
        .orderBy('name', 'asc')
      const payload = {
        version: '3.1',
        language: 'id',
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
            analyzer: 'word',
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
            epochs: 25,
          },
          {
            name: 'FallbackClassifier',
            threshold: 0.5,
            ambiguity_threshold: 0.1,
          },
        ],
        policies: [
          {
            name: 'RulePolicy',
            core_fallback_threshold: 0.7,
            core_fallback_action_name: 'action_default_fallback',
            enable_fallback_prediction: true,
          },
          {
            name: 'MemoizationPolicy',
          },
          {
            name: 'TEDPolicy',
            max_history: 5,
            epochs: 25,
          },
        ],
        intents: [
          ...intents.map((intent) => intent.name),
          ...this.rasaConfigDefault.intents
            .filter((intent) => !!intent.intent)
            .map((intent) => intent.intent),
          'nlu_fallback',
        ],
        entities: this.rasaConfigDefault.entities,
        slots: this.rasaConfigDefault.slots,
        actions: [
          'action_default_fallback',
          ...this.rasaConfigDefault.actions.map((action) => action),
        ],
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
        nlu: [
          ...intents.map((intent) => ({
            intent: intent.name,
            examples: intent.messages.reduce(
              (acc, message) =>
                acc !== '' ? `${acc}\n- ${message.content}` : `- ${message.content}`,
              ''
            ),
          })),
          ...this.rasaConfigDefault.intents.map((intent) => ({
            ...intent,
            examples: intent.examples.reduce(
              (acc, message) => (acc !== '' ? `${acc}\n- ${message}` : `- ${message}`),
              ''
            ),
          })),
        ],
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
          ...this.rasaConfigDefault.rules,
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

      this.status.processValue = 30

      const unloadResult = await this.client.delete('/model')
      if (unloadResult.status >= 300) {
        throw new Error(`Something went wrong, status code: ${unloadResult.status}`)
      }

      await BotModel.query().update({ isActive: false })

      // freeze 10 seconds
      await new Promise((resolve) => setTimeout(resolve, 10000))

      const result = await this.client.post<IncomingMessage>(
        '/model/train?force_training=true',
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
        this.status.processValue = 80

        await BotModel.query().update({ isActive: false })
        await BotModel.create({
          name: result.headers.filename,
          isActive: true,
        })

        this.status = {
          name: 'train',
          onProcess: false,
          processValue: undefined,
          success: true,
        }
      })
    } catch (error) {
      console.log(error)

      this.status = {
        name: 'train',
        onProcess: false,
        processValue: undefined,
        success: false,
      }
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

      this.status.processValue = 80

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

  public async getSuggestion() {
    const rules = await Rule.all()
    const stories = await Story.all()
    const topics = [...rules.map((rule) => rule.name), ...stories.map((story) => story.name)]
    const randomTopics = topics.sort(() => Math.random() - 0.5).slice(0, 5)
    const message = `Orang lain juga bertanya: ${randomTopics.join(', ')}`
    return message
  }

  public async getUAT() {
    const url = env.get('UAT_URL')
    if (!url) return
    const text = `Halo! Kami sangat menghargai bantuan Anda untuk menguji chatbot baru Obex Customlamp. Chatbot ini dirancang untuk membantu Anda menemukan informasi tentang produk kami dan pertanyaan umum. Anda bisa mengisi formulir di link berikut: ${url}`
    return text
  }

  public async optimizeDataset() {
    if (this.status.name === 'optimize' && this.status.onProcess) {
      console.log('Dataset is under optimizing')
      return
    }

    try {
      this.status = {
        onProcess: true,
        processValue: 10,
        success: undefined,
        name: 'optimize',
      }
      const messages = await Message.all()
      const deletedIds: number[] = []
      for (let [index, msg] of messages.entries()) {
        if (deletedIds.includes(msg.id)) {
          continue
        }
        const duplicate = await Message.query()
          .where('content', msg.content)
          .where('id', '!=', msg.id)
        // console.log('duplicate:', duplicate.length)

        if (duplicate.length > 0) {
          if (!msg.intentId) {
            await msg.delete()
            deletedIds.push(msg.id)
            continue
          }

          for (const dupMsg of duplicate) {
            await dupMsg.delete()
            deletedIds.push(dupMsg.id)
          }
        }

        const text = msg.content
        let cleaned = text.toLowerCase()

        cleaned = cleaned.replace(/[^a-z\s]/g, '')

        cleaned = cleaned.replace(/\s+/g, ' ').trim()

        msg.content = cleaned
        await msg.save()

        this.status.processValue = ((index + 1) / messages.length) * 90 + 10
      }

      console.log(`Dataset optimized, ${deletedIds.length} duplicate messages deleted`)

      this.status = {
        onProcess: false,
        processValue: undefined,
        success: true,
        name: 'optimize',
      }
    } catch (error) {
      console.log(error)

      this.status = {
        name: 'optimize',
        onProcess: false,
        processValue: undefined,
        success: false,
      }
    }
  }
}

export default new BotService()
