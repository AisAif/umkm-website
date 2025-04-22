import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Rule from '#models/rule'
import Intent from '#models/intent'
import Response from '#models/response'

export default class extends BaseSeeder {
  async run() {
    const datasetsPayload = [
      {
        intent: 'salam',
        messages: [
          'assalamualaikum',
          'halo',
          'p',
          'hai',
          'permisi',
          'selamat pagi',
          'selamat siang',
        ],
      },
      {
        intent: 'terimakasih',
        messages: [
          'terimakasih',
          'terima kasih',
          'terimakasih banyak',
          'terima kasih banyak',
          'terimakasih atas informasinya',
        ],
      },
    ]

    const intents = await Intent.createMany(
      datasetsPayload.map((dataset) => ({ name: dataset.intent }))
    )
    intents.map((intent, index) => {
      intent
        .related('messages')
        .createMany(datasetsPayload[index].messages.map((message) => ({ content: message })))
    })

    const responsesPayload = [
      {
        name: 'salam',
        content: 'Ada yang bisa saya bantu?',
      },
      {
        name: 'terimakasih',
        content: 'Sama-sama',
      },
    ]

    const responses = await Response.createMany(responsesPayload)

    const rulesPayload = [
      {
        name: 'salam',
        steps: [
          {
            position: 1,
            intentId: intents[0].id,
            responseId: responses[0].id,
          },
        ],
      },
      {
        name: 'terimakasih',
        steps: [
          {
            position: 1,
            intentId: intents[1].id,
            responseId: responses[1].id,
          },
        ],
      },
    ]
    const rules = await Rule.createMany(rulesPayload.map((rule) => ({ name: rule.name })))

    rules.map((rule, index) => {
      rule.related('steps').createMany(rulesPayload[index].steps)
    })
  }
}
