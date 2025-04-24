import Product from '#models/product'
import env from '#start/env'

interface Intent {
  name: string
  confidence: number
}

interface Entity {
  entity: string
  start: number
  end: number
  confidence_entity: number
  value: string
  extractor: string
  processors: string[]
}

interface Message {
  intent: Intent
  entities: Entity[]
  text: string
  message_id: string
  metadata: Record<string, unknown>
  text_tokens: any[]
  response_selector: Record<string, unknown>
}

interface RasaTracker {
  sender_id: string
  slots: {
    product_name: string | null
    vehicle_name: string | null
    session_started_metadata: any | null
  }
  latest_message: Message
  latest_event_time: number
  followup_action: string | null
  paused: boolean
  // events: Event[]
  latest_input_channel: string
  active_loop: Record<string, unknown>
  latest_action: {
    action_name: string
  }
  latest_action_name: string
}

class RasaWebhookService {
  public async webhook(tracker: RasaTracker) {
    let message
    try {
      switch (tracker.latest_message.intent.name) {
        case 'ask_product':
          message = await this.getProduct(tracker.latest_message.entities)
          break
        case 'ask_vehicle_model':
          message = await this.getProductFromTags(tracker.latest_message.entities)
          break
        default:
          console.log(`Unknown intent: ${tracker.latest_message.intent.name}`)
      }
    } catch (error) {
      console.log(error)
      return
    }

    return {
      events: [],
      responses: [
        {
          text: message || env.get('RASA_DEFAULT_ANSWER'),
        },
      ],
    }
  }

  private async getProduct(entities: Entity[]) {
    if (entities.length === 0) {
      return env.get('RASA_DEFAULT_ANSWER')
    }

    const product = await Product.query().where('name', 'like', `%${entities[0].value}%`).first()

    if (!product) {
      return `Maaf, produk dengan nama ${entities[0].value} tidak ditemukan. Silahkan cek produk lainnya di ${env.get('APP_URL')}/product`
    }

    const message = `Mungkin produk yang Anda cari adalah ${product.name} dengan harga mulai dari ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.startingPrice)}. Untuk detail produk, silahkan klik link berikut: ${env.get('APP_URL')}/product/${product.id}`
    return message
  }

  private async getProductFromTags(entities: Entity[]) {
    if (entities.length === 0) {
      return env.get('RASA_DEFAULT_ANSWER')
    }

    const product = await Product.query()
      .whereHas('tags', (query) => {
        query.where('name', 'like', `%${entities[0].value}%`)
      })
      .first()

    if (!product) {
      return `Maaf, produk dengan spesifikasi ${entities[0].value} tidak ditemukan. Silahkan cek produk lainnya di ${env.get('APP_URL')}/product`
    }

    const message = `Mungkin produk yang Anda cari adalah ${product.name} dengan harga mulai dari ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.startingPrice)}. Untuk detail produk, silahkan klik link berikut: ${env.get('APP_URL')}/product/${product.id}`

    return message
  }
}

export default new RasaWebhookService()
