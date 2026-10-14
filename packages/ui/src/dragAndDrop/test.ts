import * as Story from 'foldkit/story'

import { FocusItem, Message, ResolveKeyboardMove } from './index.js'

/** Input for {@link settleFocus}. `itemId` is the dragged item that the
 *  drop, cancel, or move focuses. */
export type SettleFocusInput = Readonly<{
  itemId: string
}>

/** Builds a `Story.Command.resolveAll` step that resolves the `FocusItem`
 *  Command a keyboard drop, a cancelled keyboard drag, or a resolved keyboard
 *  move schedules. Focus is the only Command those transitions emit, so the
 *  step completes them.
 *
 *  The step resolves with the child's raw result Message. `resolveAll` replays
 *  the matched Command's own recorded wrapping, so a parent that embeds the
 *  drag-and-drop Submodel settles the same way without restating its `Got*`
 *  lift.
 *
 *  @example
 *  ```ts
 *  Story.story(
 *    update,
 *    Story.given(model),
 *    Story.message(GotDragAndDropMessage({ message: DragAndDrop.Message.ConfirmedKeyboardDrop() })),
 *    DragAndDrop.test.settleFocus({ itemId: 'card-1' }),
 *  )
 *  ```
 */
export const settleFocus = ({ itemId }: SettleFocusInput) =>
  Story.Command.resolveAll([
    FocusItem({ itemId }),
    Message.CompletedFocusItem(),
  ])

/** Input for {@link resolveKeyboardMove}. `itemId` is the dragged item, and
 *  `targetContainerId` and `targetIndex` are where the arrow key moves it. */
export type ResolveKeyboardMoveInput = Readonly<{
  itemId: string
  targetContainerId: string
  targetIndex: number
}>

/** Builds a `Story.Command.resolveAll` step that resolves one arrow-key move
 *  during a keyboard drag. It answers `ResolveKeyboardMove` with the given
 *  target, which the runtime would otherwise compute from the rendered
 *  droppables, then resolves the `FocusItem` that follows.
 *
 *  @example
 *  ```ts
 *  Story.story(
 *    update,
 *    Story.given(keyboardDraggingModel),
 *    Story.message(GotDragAndDropMessage({ message: DragAndDrop.Message.PressedArrowKey({ direction: 'NextContainer' }) })),
 *    DragAndDrop.test.resolveKeyboardMove({
 *      itemId: 'card-1',
 *      targetContainerId: 'done',
 *      targetIndex: 0,
 *    }),
 *  )
 *  ```
 */
export const resolveKeyboardMove = ({
  itemId,
  targetContainerId,
  targetIndex,
}: ResolveKeyboardMoveInput) =>
  Story.Command.resolveAll(
    [
      ResolveKeyboardMove,
      Message.CompletedResolveKeyboardMove({ targetContainerId, targetIndex }),
    ],
    [FocusItem({ itemId }), Message.CompletedFocusItem()],
  )
