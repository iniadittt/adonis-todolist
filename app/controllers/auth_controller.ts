import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { RegisterValidator } from '#validators/register'
import { LoginValidator } from '#validators/login'

export default class AuthController {
  private async handleRequest(
    ctx: HttpContext,
    callback: () => Promise<void>,
    successMessage: string,
    failureMessage: string
  ) {
    try {
      await callback()
      ctx.session.flash({
        notification: {
          type: 'success',
          message: successMessage,
        },
      })
      return ctx.response.redirect('/todo')
    } catch (error) {
      ctx.session.flash({
        notification: {
          type: 'error',
          message: failureMessage,
        },
      })
      return ctx.response.redirect().back()
    }
  }

  showLogin(ctx: HttpContext) {
    return ctx.view.render('pages/auth/login')
  }

  showRegister(ctx: HttpContext) {
    return ctx.view.render('pages/auth/register')
  }

  async storeLogin(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(LoginValidator)
    await this.handleRequest(
      ctx,
      async () => {
        const user = await User.verifyCredentials(payload.email, payload.password)
        if (!user) {
          throw new Error('Invalid credentials')
        }
        await ctx.auth.use('web').login(user)
      },
      'Login berhasil.',
      'Email dan password salah.'
    )
  }

  async storeRegister(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(RegisterValidator)
    await this.handleRequest(
      ctx,
      async () => {
        const userExist = await User.findBy('email', payload.email)
        if (userExist) {
          throw new Error('Email already in use')
        }
        await User.create(payload)
        ctx.response.redirect('/login')
      },
      'Register berhasil.',
      'Email sudah digunakan.'
    )
  }

  async logout(ctx: HttpContext) {
    await ctx.auth.use('web').logout()
    return ctx.response.redirect('/login')
  }
}
