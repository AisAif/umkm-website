import BotModel from '#models/bot_model'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'

export default class BotsController {
  private client = axios.create({
    baseURL: `http://localhost:${env.get('RASA_PORT')}/`,
    params: { token: env.get('RASA_TOKEN') },
  })

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
}
