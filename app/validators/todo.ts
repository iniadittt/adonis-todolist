import vine from '@vinejs/vine'

export const PostTodoValidation = vine.compile(
  vine.object({
    title: vine.string().minLength(4),
    description: vine.string().minLength(4),
  })
)

export const UpdateTodoValidation = vine.compile(
  vine.object({
    title: vine.string().minLength(4).optional(),
    description: vine.string().minLength(4).optional(),
  })
)