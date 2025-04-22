import vine from '@vinejs/vine'

export const addResponseValidator = vine.compile(
  vine.object({
    name: vine.string(),
    content: vine.string(),
  })
)

export const editResponseValidator = vine.compile(
  vine.object({
    name: vine.string(),
    content: vine.string(),
  })
)
