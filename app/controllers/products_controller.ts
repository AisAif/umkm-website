import Product from '#models/product'
import Tag from '#models/tag'
import { addProductValidator, addTagValidator, editProductValidator } from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'

export default class ProductsController {
  async index({ request, inertia }: HttpContext) {
    let products = await Product.query()
      .preload('tags')
      .where((query) => {
        if (request.input('search')) {
          return query.where('name', 'like', `%${request.input('search')}%`)
        }
      })
      .paginate(request.input('page', 1), 10)
    const tags = await Tag.all()
    return inertia.render('dashboard/overview/product/index', { products, tags })
  }

  async list({ inertia }: HttpContext) {
    const products = await Product.query().preload('tags')
    return inertia.render('product/list/index', { products })
  }

  async show({ inertia, request, response }: HttpContext) {
    const id = request.param('id')
    if (!id) {
      return response.redirect().toRoute('product.list')
    }
    const product = await Product.query().preload('tags').where('id', id).first()
    if (!product) {
      return response.redirect().toRoute('product.list')
    }

    const products = await Product.query().preload('tags').orderByRaw('RAND()').limit(3)

    return inertia.render('product/detail/index', { product, products })
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(addProductValidator)
    // console.log(payload)
    try {
      const image = request.file('image')
      if (!image) {
        session.flash('message', {
          type: 'error',
          text: 'Image is required',
        })
        return response.redirect().toRoute('product.index')
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${image.extname}`
      await image.moveToDisk(fileName, 's3')
      const imageUrl = await drive.use('s3').getUrl(fileName)
      await Product.create({
        name: payload.name,
        description: payload.description,
        image: imageUrl,
        startingPrice: payload.starting_price,
      })

      session.flash('message', {
        type: 'success',
        text: 'Product successfully added',
      })

      return response.redirect().toRoute('product.index')
    } catch (error) {
      session.flash('message', {
        type: 'error',
        text: 'Failed to add product',
      })
      return response.redirect().toRoute('product.index')
    }
  }

  async update({ request, response, session }: HttpContext) {
    const product = await Product.find(request.param('id'))
    if (!product) {
      session.flash('message', {
        type: 'error',
        text: 'Product not found',
      })
      return response.redirect().toRoute('product.index')
    }

    const payload = await request.validateUsing(editProductValidator)
    // console.log(payload)

    product.name = payload.name
    product.description = payload.description
    product.startingPrice = payload.starting_price

    const image = request.file('image')
    if (image) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${image.extname}`
      await image.moveToDisk(fileName, 's3')
      const imageUrl = await drive.use('s3').getUrl(fileName)
      console.log(imageUrl)
      product.image = imageUrl
    }

    await product.save()

    session.flash('message', {
      type: 'success',
      text: 'Product successfully updated',
    })

    return response.redirect().toRoute('product.index')
  }

  async destroy({ request, response, session }: HttpContext) {
    const product = await Product.find(request.param('id'))
    if (!product) {
      session.flash('message', {
        type: 'error',
        text: 'Product not found',
      })
      return response.redirect().toRoute('product.index')
    }

    await product.delete()

    session.flash('message', {
      type: 'success',
      text: 'Product successfully deleted',
    })

    return response.redirect().toRoute('product.index')
  }

  async storeTag({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(addTagValidator)
    await Tag.create({
      name: payload.name,
    })

    session.flash('message', {
      type: 'success',
      text: 'Tag successfully added',
    })

    return response.redirect().toRoute('product.index')
  }

  async destroyTag({ request, response, session }: HttpContext) {
    const tag = await Tag.find(request.param('id'))
    if (!tag) {
      session.flash('message', {
        type: 'error',
        text: 'Tag not found',
      })
      return response.redirect().toRoute('product.index')
    }

    await tag.delete()

    session.flash('message', {
      type: 'success',
      text: 'Tag successfully deleted',
    })

    return response.redirect().toRoute('product.index')
  }

  async toggleProductTag({ request, response, session }: HttpContext) {
    const product = await Product.find(request.param('product_id'))
    if (!product) {
      session.flash('message', {
        type: 'error',
        text: 'Product not found',
      })
      return response.redirect().toRoute('product.index')
    }
    const tag = await Tag.find(request.param('tag_id'))
    if (!tag) {
      session.flash('message', {
        type: 'error',
        text: 'Tag not found',
      })
      return response.redirect().toRoute('product.index')
    }

    const productTag = await product.related('tags').query().where('tag_id', tag.id).first()
    if (productTag) {
      await product.related('tags').detach([tag.id])
    } else {
      await product.related('tags').attach([tag.id])
    }

    session.flash('message', {
      type: 'success',
      text: 'Tag successfully updated',
    })

    return response.redirect().toRoute('product.index')
  }
}
