import User from '#models/user'
import { loginValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async store({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(payload.email, payload.password)

    await auth.use('web').login(user)

    response.redirect('/dashboard')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect('/auth/login')
  }
}
