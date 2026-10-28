---
'foldkit': minor
---

Subscription entries accept an optional `when` predicate on the Model. While it returns `false`, the Runtime runs no Stream for the entry and does not call `modelToDependencies`. A child entry's `when` also applies after a lift or Binding, alongside the parent's own gate, and a lifted entry's `maybeDependencies` is `None` whenever any gate in its lift chain is closed.

Scene adds `Subscription.expectActive(entry)` and `Subscription.expectInactive(entry)`, which check the same gates against the current Model. A condition inside the handler's Stream, such as `Stream.when`, is not visible to them; move it into `when` to make it testable. `Subscription.emit` does not check activity.

```ts
const subscriptions = NameCardDefinition.makeSubscriptions(entry => ({
  escapePresses: entry('EscapePresses', {
    messages: [Message.PressedEscape],
    when: model => Option.isSome(model.maybeOpenCardId),
    handler: function* () {
      return () => escapeKeyPresses
    },
  }),
}))

scene(
  { update, view, subscriptions },
  given(initialModel),
  Subscription.expectInactive(subscriptions.escapePresses),
  click(role('button', { name: 'Show name card' })),
  Subscription.expectActive(subscriptions.escapePresses),
)
```
