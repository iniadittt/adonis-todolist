import vine from '@vinejs/vine'

export const RegisterValidator = vine.compile(
  vine.object({
    fullName: vine.string().minLength(4),
    email: vine.string().minLength(8).email().normalizeEmail(),
    password: vine.string().minLength(8),
  })
)
