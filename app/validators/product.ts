import vine from '@vinejs/vine'

export const addProductValidator = vine.compile(
  vine.object({
    name: vine.string(),
    description: vine.string(),
    image: vine.file({
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png'],
    }),
    starting_price: vine.number(),
  })
)

export const editProductValidator = vine.compile(
  vine.object({
    name: vine.string(),
    description: vine.string(),
    image: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png'],
      })
      .nullable(),
    starting_price: vine.number(),
  })
)

export const addTagValidator = vine.compile(
  vine.object({
    name: vine.string(),
  })
)
