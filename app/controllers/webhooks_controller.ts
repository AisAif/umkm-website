import type { HttpContext } from '@adonisjs/core/http'

export default class WebhooksController {
  private facebookConfig = {
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
    tokenVerification: process.env.FACEBOOK_TOKEN_VERIFICATION,
    url: process.env.FACEBOOK_URL,
  }
  public async index() {}

  public async postFacebook({ request, response }: HttpContext) {
    if (request.body()['object'] === 'page') {
      // Returns a '200 OK' response to all requests
      response.status(200).send('EVENT_RECEIVED')
      // Determine which webhooks were triggered and get sender PSIDs and locale, message content and more.
    } else {
      // Return a '404 Not Found' if event is not from a page subscription
      response.status(404)
    }
  }

  public async getFacebook({ request, response }: HttpContext) {
    console.log(request.all())
    let mode = request.qs()['hub.mode']
    let token = request.qs()['hub.verify_token']
    let challenge = request.qs()['hub.challenge']

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
      // Check the mode and token sent is correct
      if (mode === 'subscribe' && token === this.facebookConfig.tokenVerification) {
        // Respond with the challenge token from the request
        console.log('WEBHOOK_VERIFIED')
        response.status(200).send(challenge)
      } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        response.status(403)
      }
    }
  }

  public async instagram(context: HttpContext) {
    console.log(context.request.all())
    return {}
  }
}
