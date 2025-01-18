import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'steps'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('position').notNullable()
      table.integer('story_id').unsigned().references('stories.id').onDelete('CASCADE').nullable()
      table.integer('rule_id').unsigned().references('rules.id').onDelete('CASCADE').nullable()
      table.integer('intent_id').unsigned().references('intents.id').onDelete('CASCADE')
      table.integer('response_id').unsigned().references('responses.id').onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
