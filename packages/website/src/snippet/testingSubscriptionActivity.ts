import { Subscription, click, given, role, scene } from 'foldkit/scene'

scene(
  { update, view, subscriptions },
  given(initialModel),
  Subscription.expectInactive(subscriptions.escapePresses),
  click(role('button', { name: 'Show name card' })),
  Subscription.expectActive(subscriptions.escapePresses),
  Subscription.emit(subscriptions.escapePresses, Message.PressedEscape()),
  Subscription.expectInactive(subscriptions.escapePresses),
)
