import type { HttpContext } from '@adonisjs/core/http'

export default class BotsController {
  public async index({ inertia }: HttpContext) {
    return inertia.render('dashboard/bot/index')
  }
}
