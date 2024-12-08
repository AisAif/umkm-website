import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import crypto from 'node:crypto'

export default class VerifyFbWebhookSignatureMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    var signature = ctx.request.header('x-hub-signature-256')

    if (!signature) {
      console.warn(`Couldn't find "x-hub-signature-256" in headers.`)
      return
    } else {
      var elements = signature.split('=')
      var signatureHash = elements[1]

      if (!process.env.FACEBOOK_APP_SECRET)
        throw new Error('FACEBOOK_APP_SECRET environment variable is not set')

      var expectedHash = crypto
        .createHmac('sha256', process.env.FACEBOOK_APP_SECRET)
        .update(ctx.request.raw() ?? '')
        .digest('hex')
      if (signatureHash !== expectedHash) {
        throw new Error("Couldn't validate the request signature.")
      }
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
