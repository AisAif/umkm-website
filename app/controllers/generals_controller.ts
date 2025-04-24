import type { HttpContext } from '@adonisjs/core/http'

import Product from '#models/product'

export default class GeneralsController {
  async index({ inertia }: HttpContext) {
    const products = await Product.query().preload('tags').limit(3).orderBy('created_at', 'desc')
    return inertia.render('home/index', { products })
  }
}
