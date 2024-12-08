/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
// import { middleware } from './kernel.js'

const WebhookController = () => import('#controllers/webhooks_controller')

router.on('/').renderInertia('home/index')
router
  .group(() => {
    router.post('/facebook', [WebhookController, 'postFacebook'])
    // .use(middleware.verifyFbWebhookSignature())
    router.get('/facebook', [WebhookController, 'getFacebook'])
    // .use(middleware.verifyFbWebhookSignature())
  })
  .prefix('/webhook')
