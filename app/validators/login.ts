import vine from '@vinejs/vine'

export const LoginValidator = vine.compile(
  vine.object({
    email: vine.string().minLength(8).email().normalizeEmail(),
    password: vine.string().minLength(8),
  })
)
