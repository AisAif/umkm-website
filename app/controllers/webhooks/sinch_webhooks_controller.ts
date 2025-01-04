import type { HttpContext } from '@adonisjs/core/http'
import axios, { AxiosError } from 'axios'

export default class SinchWebhooksController {
  private sinchConfig = {
    projectId: process.env.SINCH_PROJECT_ID,
    tokenVerification: process.env.SINCH_TOKEN_VERIFICATION,
  }

  private client = axios.create({
    baseURL: process.env.SINCH_URL || 'https://us.conversation.api.sinch.com/v1/projects/',
    headers: {
      'Content-Type': 'application/json',
      'Authorization':
        'Basic ' +
        Buffer.from(process.env.SINCH_ACCESS_KEY + ':' + process.env.SINCH_SECRET_KEY).toString(
          'base64'
        ),
    },
  })

  public async index() {}

  public async post({ request, response }: HttpContext) {
    var requestBody = request.body()
    console.log(requestBody)

    if (!requestBody) {
      response.send('Could not process request')
      return
    }

    const sendMessage = {
      app_id: requestBody.app_id,
      recipient: {
        contact_id: requestBody.message.contact_id,
      },
      message: {
        text_message: {
          text: 'You sent: ' + requestBody.message.contact_message.text_message.text,
        },
      },
      channel_priority_order: [requestBody.message.channel_identity.channel],
    }
    console.log(sendMessage)

    let result
    try {
      result = await this.client.post(this.sinchConfig.projectId + '/messages:send', sendMessage)
    } catch (error) {
      if (error instanceof AxiosError) {
        console.warn(error.response?.data)
      }

      response.send('Could not process request')
      return
    }

    console.log(result?.data)
    response.send('Ok')
  }
}
