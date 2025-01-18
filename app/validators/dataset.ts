import vine from '@vinejs/vine'

export const addDatasetValidator = vine.compile(
  vine.object({
    content: vine.string(),
    intentId: vine.number().optional(),
  })
)

export const editDatasetValidator = vine.compile(
  vine.object({
    content: vine.string(),
    intentId: vine.number().optional(),
  })
)
