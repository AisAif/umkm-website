import BotService from '#services/bot_service'
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

    if (!BotService.providers.find((prov) => prov.name === 'sinch')?.isActive) {
      response.send('Could not process request, sinch is disabled')
      return
    }

    const botResult = await BotService.sendMessage({
      message: requestBody.message.contact_message.text_message.text,
      sender: requestBody.message.contact_id,
    })

    const sendMessage = {
      app_id: requestBody.app_id,
      recipient: {
        contact_id: requestBody.message.contact_id,
      },
      message: {
        text_message: {
          text: botResult.data[0].text,
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

    // send suggestions
    if (Math.random() < 0.4) {
      try {
        sendMessage.message.text_message.text = await BotService.getSuggestion()
        result = await this.client.post(this.sinchConfig.projectId + '/messages:send', {
          sendMessage,
        })
      } catch (error) {
        if (error instanceof AxiosError) {
          console.warn(error.response?.data)
        }

        response.send('Could not process request')
        return
      }
    }

    response.send('Ok')
  }
}
