import vine from '@vinejs/vine'

export const sendMessageValidator = vine.compile(
  vine.object({
    sender: vine.string(),
    message: vine.string(),
  })
)
