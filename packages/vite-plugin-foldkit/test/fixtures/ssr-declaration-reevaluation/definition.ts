import { Schema } from 'effect'
import { Block } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const Model = Schema.Struct({ isTicking: Schema.Boolean })

export const Message = defineMessageUnion({
  Ticked: {},
  CompletedLoadPreferences: {},
})

export const ApplicationDefinition = Block.makeDefinition('Application', {
  Model,
  Message,
})
