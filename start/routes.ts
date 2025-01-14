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

const FacebookWebhookController = () => import('#controllers/webhooks/facebook_webhooks_controller')
const SinchWebhookController = () => import('#controllers/webhooks/sinch_webhooks_controller')
const SessionController = () => import('#controllers/session_controller')
const BotsController = () => import('#controllers/bots_controller')

router.on('/').renderInertia('home/index')
router.on('/privacy').renderInertia('home/privacy')
router.on('/terms').renderInertia('home/terms')

router
  .group(() => {
    router.on('/login').renderInertia('auth/login').use(middleware.guest())
    router.post('/login', [SessionController, 'store']).use(middleware.guest())

    router.delete('/logout', [SessionController, 'destroy']).use(middleware.auth())
  })
  .prefix('/auth')

router
  .group(() => {
    router.on('/').renderInertia('dashboard/index').use(middleware.auth())

    router
      .group(() => {
        router.get('/model', [BotsController, 'index']).use(middleware.auth()).as('bot.model.index')
        router
          .put('/model/:id/activate', [BotsController, 'activate'])
          .use(middleware.auth())
          .as('bot.model.activate')
      })
      .prefix('/bot')
  })
  .prefix('/dashboard')

router
  .group(() => {
    router.post('/facebook', [FacebookWebhookController, 'postFacebook'])
    // .use(middleware.verifyFbWebhookSignature())
    router.get('/facebook', [FacebookWebhookController, 'getFacebook'])
    // .use(middleware.verifyFbWebhookSignature())

    router.post('/sinch', [SinchWebhookController, 'post'])
  })
  .prefix('/webhook')
