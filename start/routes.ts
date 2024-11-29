/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const WebhookController = () => import('#controllers/webhooks_controller')

router.on('/').renderInertia('home/index')
router
  .group(() => {
    router.post('/facebook', [WebhookController, 'postFacebook'])
    router.get('/facebook', [WebhookController, 'getFacebook'])

    router.post('/instagram', [WebhookController, 'instagram'])
  })
  .prefix('/webhook')
