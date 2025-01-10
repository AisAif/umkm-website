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
// import { middleware } from './kernel.js'

const FacebookWebhookController = () => import('#controllers/webhooks/facebook_webhooks_controller')
const SinchWebhookController = () => import('#controllers/webhooks/sinch_webhooks_controller')
const SessionController = () => import('#controllers/session_controller')

router.on('/').renderInertia('home/index')
router.on('/privacy').renderInertia('home/privacy')
router.on('/terms').renderInertia('home/terms')

router
  .group(() => {
    router.on('/login').renderInertia('auth/login').use(middleware.guest())
    router.post('/login', [SessionController, 'store']).use(middleware.guest())
  })
  .prefix('/auth')

router
  .group(() => {
    router.post('/facebook', [FacebookWebhookController, 'postFacebook'])
    // .use(middleware.verifyFbWebhookSignature())
    router.get('/facebook', [FacebookWebhookController, 'getFacebook'])
    // .use(middleware.verifyFbWebhookSignature())

    router.post('/sinch', [SinchWebhookController, 'post'])
  })
  .prefix('/webhook')
