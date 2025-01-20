import Message from '#models/message'
import env from '#start/env'
import axios from 'axios'

export class BotService {
  private client = axios.create({
    baseURL: `http://${env.get('NODE_ENV') === 'development' ? 'localhost' : 'rasa'}:${env.get('RASA_PORT')}/`,
    params: { token: env.get('RASA_SECRET') },
  })

  public async sendMessage({ sender, message }: { sender: string; message: string }) {
    const result = await this.client.post('/webhooks/rest/webhook', {
      sender: sender,
      message: message,
    })

    if (result.data[0].text === env.get('RASA_DEFAULT_ANSWER')) {
      await Message.create({
        content: message,
      })
    }

    return result
  }
}
