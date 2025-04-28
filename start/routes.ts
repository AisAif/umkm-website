/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const ProductsController = () => import('#controllers/products_controller')
const FacebookWebhookController = () => import('#controllers/webhooks/facebook_webhooks_controller')
const SinchWebhookController = () => import('#controllers/webhooks/sinch_webhooks_controller')
const SessionController = () => import('#controllers/session_controller')
const BotsController = () => import('#controllers/bots_controller')
const GeneralsController = () => import('#controllers/generals_controller')

router.get('/', [GeneralsController, 'index']).as('home.index')
router.on('/privacy').renderInertia('home/privacy')
router.on('/terms').renderInertia('home/terms')
router.post('/send-message', [BotsController, 'sendMessage']).as('bot.message.send')

router
  .group(() => {
    router.get('/', [ProductsController, 'list']).as('product.list')
    router.get('/:id', [ProductsController, 'show']).as('product.show')
  })
  .prefix('/product')

router
  .group(() => {
    router.on('/login').renderInertia('auth/login').use(middleware.guest())
    router.post('/login', [SessionController, 'store']).use(middleware.guest())

    router.delete('/logout', [SessionController, 'destroy']).use(middleware.auth())
  })
  .prefix('/auth')

router
  .group(() => {
    router.on('/').renderInertia('dashboard/index')

    router
      .group(() => {
        router
          .group(() => {
            router.get('/', [ProductsController, 'index']).as('product.index')
            router.post('/', [ProductsController, 'store']).as('product.store')
            router.put('/:id', [ProductsController, 'update']).as('product.update')
            router.delete('/:id', [ProductsController, 'destroy']).as('product.destroy')
          })
          .prefix('product')
        router
          .group(() => {
            router.post('/', [ProductsController, 'storeTag']).as('tag.store')
            router
              .put('/:tag_id/product/:product_id', [ProductsController, 'toggleProductTag'])
              .as('tag.update')
            router.delete('/:id', [ProductsController, 'destroyTag']).as('tag.destroy')
          })
          .prefix('tag')
      })
      .prefix('overview')

    router
      .group(() => {
        router
          .group(() => {
            router.get('/', [BotsController, 'index']).as('bot.model.index')
            router.put('/:id/activate', [BotsController, 'activate']).as('bot.model.activate')
            router.post('/train', [BotsController, 'trainModel']).as('bot.model.train')
            router.get('/status', [BotsController, 'status']).as('bot.model.status')
          })
          .prefix('model')

        router
          .group(() => {
            router.get('/', [BotsController, 'getDataset']).as('bot.dataset.index')
            router.post('/', [BotsController, 'addDataset']).as('bot.dataset.add')
            router
              .post('/add/file', [BotsController, 'addDatasetViaFile'])
              .as('bot.dataset.add.file')
            router
              .post('/add/json', [BotsController, 'addDatasetViaJson'])
              .as('bot.dataset.add.json')
            router.put('/:id', [BotsController, 'editDataset']).as('bot.dataset.edit')
            router.get('/export', [BotsController, 'exportDataset']).as('bot.dataset.export')
            router.delete('/:id', [BotsController, 'deleteDataset']).as('bot.dataset.delete')
          })
          .prefix('dataset')

        router
          .group(() => {
            router.post('/add', [BotsController, 'addIntent']).as('bot.intent.add')
            router.delete('/:id', [BotsController, 'deleteIntent']).as('bot.intent.delete')
            router
              .post('/:id/message/:message_id', [BotsController, 'addMessageToIntent'])
              .as('bot.intent.message.add')
          })
          .prefix('intent')

        router
          .group(() => {
            router.get('/', [BotsController, 'getResponse']).as('bot.response.index')
            router.post('/', [BotsController, 'addResponse']).as('bot.response.add')
            router.put('/:id', [BotsController, 'editResponse']).as('bot.response.edit')
            router.delete('/:id', [BotsController, 'deleteResponse']).as('bot.response.delete')
          })
          .prefix('response')

        router
          .group(() => {
            router.get('/', [BotsController, 'getStory']).as('bot.story.index')
            router.post('/', [BotsController, 'addStory']).as('bot.story.add')
            router.put('/:id', [BotsController, 'editStory']).as('bot.story.edit')
            router.delete('/:id', [BotsController, 'deleteStory']).as('bot.story.delete')
          })
          .prefix('story')

        router
          .group(() => {
            router.get('/', [BotsController, 'getRule']).as('bot.rule.index')
            router.post('/', [BotsController, 'addRule']).as('bot.rule.add')
            router.put('/:id', [BotsController, 'editRule']).as('bot.rule.edit')
            router.delete('/:id', [BotsController, 'deleteRule']).as('bot.rule.delete')
          })
          .prefix('rule')

        router
          .group(() => {
            router.get('/', [BotsController, 'getIntegration']).as('bot.integration.index')
            router.post('/toggle-activate', [BotsController, 'toggleActivate'])
          })
          .prefix('integration')
      })
      .prefix('/bot')
  })
  .prefix('/dashboard')
  .use(middleware.auth())

router
  .group(() => {
    router.post('/facebook', [FacebookWebhookController, 'postFacebook'])
    // .use(middleware.verifyFbWebhookSignature())
    router.get('/facebook', [FacebookWebhookController, 'getFacebook'])
    // .use(middleware.verifyFbWebhookSignature())

    router.post('/sinch', [SinchWebhookController, 'post'])

    router.post('/rasa', [BotsController, 'webhook'])
  })
  .prefix('/webhook')
