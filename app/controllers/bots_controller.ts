import BotModel from '#models/bot_model'
import Message from '#models/message'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'
import fs from 'node:fs/promises'
import AdmZip from 'adm-zip'
import Intent from '#models/intent'
// import path from 'node:path'

export default class BotsController {
  private client = axios.create({
    baseURL: `http://localhost:${env.get('RASA_PORT')}/`,
    params: { token: env.get('RASA_TOKEN') },
  })

  private ignoredSenderNames = env.get('IGNORED_SENDER_NAMES')?.split(',') ?? []

  public async index({ inertia, request }: HttpContext) {
    const models = await BotModel.query().paginate(request.input('page', 1), 10)
    return inertia.render('dashboard/bot/model/index', { models })
  }

  public async activate({ request, response, session }: HttpContext) {
    const model = await BotModel.findOrFail(request.param('id'))
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
}
