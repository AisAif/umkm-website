import BotService from '#services/bot_service'
import type { HttpContext } from '@adonisjs/core/http'
import axios, { AxiosError } from 'axios'

export default class FacebookWebhooksController {
  private facebookConfig = {
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
    // fbAccessToken: process.env.FACEBOOK_ACCESS_TOKEN,
    // igAccessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    pageId: process.env.FACEBOOK_PAGE_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
    tokenVerification: process.env.FACEBOOK_TOKEN_VERIFICATION,
  }

  private client = axios.create({
    baseURL: process.env.FACEBOOK_URL || 'https://graph.facebook.com/v21.0/',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  public async index() {}

  private handleFacebookMessage(
    body: Record<string, any>,
    callback: (sender: string, message: string) => void
  ) {
    body.entry.forEach(async (entry: any) => {
      const webhookEvent = entry.messaging[0]
      const senderId = webhookEvent.sender?.id
      console.log({ time: new Date(), webhookEvent, senderId })

      if (webhookEvent.message && senderId !== this.facebookConfig.pageId) {
        const sender = `user-${senderId}`
        const result = await BotService.sendMessage({
          message: webhookEvent.message.text,
          sender,
        })
        callback(senderId, result)
      }
    })
  }

  public async postFacebook({ request, response }: HttpContext) {
    console.log('webhook called')
    console.log(request.body())
    const body = request.body()
    if (!BotService.providers.find((prov) => prov.name === 'facebook')?.isActive) {
      response.send('Could not process request, facebook is disabled')
      return
    }

    if (body.object === 'page') {
      this.handleFacebookMessage(body, async (senderId, message) => {
        try {
          const messageBody = {
            recipient: {
              id: senderId,
            },
            message_type: 'RESPONSE',
            message: {
              text: message,
            },
          }
          console.log({ messageBody })
          const result = await this.client.post(
            `${this.facebookConfig.pageId}/messages?access_token=${this.facebookConfig.accessToken}`,
            messageBody
          )
          console.log({ result })
        } catch (error) {
          if (error instanceof AxiosError) {
            console.warn(error.response?.data)
          }
        }

        // send suggestions
        if (Math.random() < 0.4) {
          try {
            const suggestion = await BotService.getSuggestion()
            await this.client.post(
              `${this.facebookConfig.pageId}/messages?access_token=${this.facebookConfig.accessToken}`,
              {
                recipient: {
                  id: senderId,
                },
                message_type: 'RESPONSE',
                message: {
                  text: suggestion,
                },
              }
            )
          } catch (error) {
            if (error instanceof AxiosError) {
              console.warn(error.response?.data)
            }
          }
        } else {
          const uatMessage = await BotService.getUAT()
          if (Math.random() < 0.6 && uatMessage) {
            try {
              await this.client.post(
                `${this.facebookConfig.pageId}/messages?access_token=${this.facebookConfig.accessToken}`,
                {
                  recipient: {
                    id: senderId,
                  },
                  message_type: 'RESPONSE',
                  message: {
                    text: uatMessage,
                  },
                }
              )
            } catch (error) {
              if (error instanceof AxiosError) {
                console.warn(error.response?.data)
              }
            }
          }
        }
      })
    } else if (body.object === 'instagram') {
      this.handleFacebookMessage(body, async (senderId, message) => {
        try {
          await this.client.post(
            `me/messages?access_token=${this.facebookConfig.accessToken}`,
            {
              recipient: {
                id: senderId,
              },
              message: {
                text: message,
              },
            }
            // `recipient={"id":"${senderId}"}&message={"text":"Ok"}`
          )
        } catch (error) {
          if (error instanceof AxiosError) {
            console.warn(error.response?.data)
          }
        }
      })
    }
  }

  public async getFacebook({ request, response }: HttpContext) {
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
}
