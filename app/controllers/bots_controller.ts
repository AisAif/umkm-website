import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import env from '#start/env'

export default class BotsController {
  public async index({ inertia }: HttpContext) {
    const result = await drive.use('s3').listAll(env.get('NODE_ENV'))
    const models = []
    for (const model of result.objects) {
      models.push(model)
    }
    return inertia.render('dashboard/bot/index', { models })
  }
}
