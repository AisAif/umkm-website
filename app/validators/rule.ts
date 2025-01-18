import vine from '@vinejs/vine'

export const addRuleValidator = vine.compile(
  vine.object({
    name: vine.string(),
    steps: vine
      .array(
        vine.object({
          position: vine.number(),
          intentId: vine.number(),
          responseId: vine.number(),
        })
      )
      .minLength(1),
  })
)

export const editRuleValidator = vine.compile(
  vine.object({
    name: vine.string(),
    steps: vine
      .array(
        vine.object({
          position: vine.number(),
          intentId: vine.number(),
          responseId: vine.number(),
        })
      )
      .minLength(1),
  })
)
