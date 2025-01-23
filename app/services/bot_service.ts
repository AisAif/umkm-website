import Message from '#models/message'
import env from '#start/env'
import axios from 'axios'

class BotService {
  private client = axios.create({
    baseURL: `http://${env.get('NODE_ENV') === 'development' ? 'localhost' : 'rasa'}:${env.get('RASA_PORT')}/`,
    params: { token: env.get('RASA_SECRET') },
  })

  public providers = [
    {
      name: 'sinch',
      isActive: false,
    },
    {
      name: 'facebook',
      isActive: false,
    },
  ]

  public toggleActivate({ name, isActive }: { name: string; isActive: boolean }) {
    const provider = this.providers.find((prov) => prov.name === name)
    if (provider) {
      provider.isActive = isActive
    }
  }

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

export default new BotService()
