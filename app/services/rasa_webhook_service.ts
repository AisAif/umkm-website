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
    return 'get product'
  }

  private async getProductFromTags(entities: Entity[]) {
    return 'get product from tags'
  }
}

export default new RasaWebhookService()
