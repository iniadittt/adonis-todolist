import type { HttpContext } from '@adonisjs/core/http'
import Todo from '#models/todo'
import { PostTodoValidation, UpdateTodoValidation } from '#validators/todo'

export default class TodosController {
  private async ensureAuthenticated(ctx: HttpContext) {
    if (!ctx.auth.user) {
      ctx.session.flash({
        notification: {
          type: 'error',
          message: 'Silakan login kembali.',
        },
      })
      ctx.response.redirect('/login')
      return false
    }
    return true
  }

  private async handleRequest(ctx: HttpContext, callback: () => Promise<any>) {
    if (!(await this.ensureAuthenticated(ctx))) return
    try {
      await callback()
    } catch (error) {
      ctx.session.flash({
        notification: {
          type: 'error',
          message: 'Internal server error.',
        },
      })
      ctx.response.redirect().back()
    }
  }

  async index(ctx: HttpContext) {
    if (!(await this.ensureAuthenticated(ctx))) return
    const userId = ctx.auth.user!.id
    const [todoCompleated, todoNotCompleated] = await Promise.all([
      Todo.query().where('userId', userId).andWhere('status', true),
      Todo.query().where('userId', userId).andWhere('status', false),
    ])
    return ctx.view.render('pages/todo/index', { todoCompleated, todoNotCompleated })
  }

  async edit(ctx: HttpContext) {
    if (!(await this.ensureAuthenticated(ctx))) return
    const userId = ctx.auth.user!.id
    const [todo, todoCompleated, todoNotCompleated] = await Promise.all([
      Todo.query().where('userId', userId).andWhere('id', ctx.params.id).firstOrFail(),
      Todo.query().where('userId', userId).andWhere('status', true),
      Todo.query().where('userId', userId).andWhere('status', false),
    ])
    return ctx.view.render('pages/todo/detail', { todo, todoCompleated, todoNotCompleated })
  }

  async store(ctx: HttpContext) {
    await this.handleRequest(ctx, async () => {
      const payload = await ctx.request.validateUsing(PostTodoValidation)
      await ctx.auth.user!.related('todo').create({
        title: payload.title,
        description: payload.description,
      })
      ctx.session.flash({
        notification: {
          type: 'success',
          message: 'Berhasil menambahkan todo',
        },
      })
      ctx.response.redirect('/todo')
    })
  }

  async update(ctx: HttpContext) {
    await this.handleRequest(ctx, async () => {
      const payload = await ctx.request.validateUsing(UpdateTodoValidation)
      const todoId = ctx.params.id
      const todo = await ctx.auth.user!.related('todo').query().where('id', todoId).firstOrFail()
      todo.merge({
        title: payload.title,
        description: payload.description,
      })
      await todo.save()
      ctx.session.flash({
        notification: {
          type: 'success',
          message: 'Todo berhasil diperbarui',
        },
      })
      ctx.response.redirect('/todo')
    })
  }

  async updateStatus(ctx: HttpContext) {
    await this.handleRequest(ctx, async () => {
      const todoId = ctx.params.id
      const status = ctx.request.qs().status === '1'
      const todo = await ctx.auth.user!.related('todo').query().where('id', todoId).firstOrFail()
      todo.merge({ status })
      await todo.save()
      ctx.session.flash({
        notification: {
          type: 'success',
          message: 'Todo berhasil diperbarui',
        },
      })
      ctx.response.redirect('/todo')
    })
  }

  async delete(ctx: HttpContext) {
    await this.handleRequest(ctx, async () => {
      const todoId = ctx.params.id
      const todo = await ctx.auth.user!.related('todo').query().where('id', todoId).firstOrFail()
      await todo.delete()
      ctx.session.flash({
        notification: {
          type: 'success',
          message: 'Todo berhasil dihapus',
        },
      })
      ctx.response.redirect('/todo')
    })
  }
}
