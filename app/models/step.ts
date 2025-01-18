import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Rule from './rule.js'
import Story from './story.js'
import Intent from './intent.js'
import Response from './response.js'

export default class Step extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare position: number

  @column()
  declare intentId: number

  @column()
  declare responseId: number

  @column()
  declare ruleId?: number

  @column()
  declare storyId?: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Rule)
  declare rule: BelongsTo<typeof Rule>

  @belongsTo(() => Story)
  declare story: BelongsTo<typeof Story>

  @belongsTo(() => Intent)
  declare intent: BelongsTo<typeof Intent>

  @belongsTo(() => Response)
  declare response: BelongsTo<typeof Response>
}
