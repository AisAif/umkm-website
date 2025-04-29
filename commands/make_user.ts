import User from '#models/user'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class MakeUser extends BaseCommand {
  static commandName = 'make:user'
  static description = 'make user'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    try {
      const email = await this.prompt.ask('Email: ')
      const password = await this.prompt.secure('Password: ')
      const fullName = await this.prompt.ask('Full Name: ')
      await User.create({ email, password, fullName })
      this.logger.info('User created')
    } catch (error) {
      this.logger.info(error)
    }
  }
}
