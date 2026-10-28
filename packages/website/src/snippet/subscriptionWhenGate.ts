import { Option, Schema } from 'effect'
import { Block, Dom } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

const Model = Schema.Struct({
  maybeOpenCardId: Schema.Option(Schema.String),
})

const Message = defineMessageUnion({
  PressedEscape: {},
})

const NameCardDefinition = Block.makeDefinition('NameCard', {
  Model,
  Message,
})

export const subscriptions = NameCardDefinition.makeSubscriptions(entry => ({
  escapePresses: entry('EscapePresses', {
    messages: [Message.PressedEscape],
    when: model => Option.isSome(model.maybeOpenCardId),
    handler: function* () {
      return () =>
        Dom.streamFromEventFilterMap({
          target: window,
          type: 'keydown',
          filterMapEvent: event =>
            event.key === 'Escape'
              ? Option.some(Message.PressedEscape())
              : Option.none(),
        })
    },
  }),
}))
