/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const AuthController = () => import('#controllers/auth_controller')
const TodosController = () => import('#controllers/todos_controller')

router
  .get('/', ({ view }) => {
    return view.render('pages/home')
  })
  .as('home.show')

router.group(() => {
  router.get('login', [AuthController, 'showLogin']).as('auth.login.show')
  router.get('register', [AuthController, 'showRegister']).as('auth.register.show')
  router.post('login', [AuthController, 'storeLogin']).as('auth.login.store')
  router.post('register', [AuthController, 'storeRegister']).as('auth.register.store')
})

router
  .group(() => {
    router.delete('logout', [AuthController, 'logout']).as('auth.logout')
    router.get('todo', [TodosController, 'index']).as('todo.show')
    router.get('todo/:id', [TodosController, 'edit']).as('todo.detail')
    router.post('todo', [TodosController, 'store']).as('todo.store')
    router.patch('todo/:id', [TodosController, 'update']).as('todo.update')
    router.patch('todo/:id/status', [TodosController, 'updateStatus']).as('todo.status.update')
    router.delete('todo/:id', [TodosController, 'delete']).as('todo.destroy')
  })
  .middleware(middleware.auth())
