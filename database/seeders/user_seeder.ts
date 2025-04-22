import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        email: 'admin@example.com',
        password: 'password',
        fullName: 'Admin',
      },
      {
        email: 'user@example.com',
        password: 'password',
        fullName: 'User',
      },
    ])
  }
}
