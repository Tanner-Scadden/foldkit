import * as Story from 'foldkit/story'

import { FocusItem, Message, ResolveKeyboardMove } from './index.js'

/** Input for {@link settleFocus}. `itemId` is the dragged item that the
 *  drop, cancel, or move focuses. */
export type SettleFocusInput = Readonly<{
  itemId: string
}>

/** Builds a `Story.Command.resolve` step that resolves the `FocusItem`
 *  Command a keyboard drop, a cancelled keyboard drag, or a resolved keyboard
 *  move returns. Throws if that item has no pending focus Command. Other
 *  Commands returned by the parent stay pending for the story to resolve.
 *
 *  The step resolves with the child's raw result Message. `resolve` replays
 *  the matched Command's own recorded wrapping, so a parent that embeds the
 *  drag-and-drop Submodel settles the same way without restating its `Got*`
 *  lift.
 *
 *  @example
 *  ```ts
 *  Story.story(
 *    update,
 *    Story.given(model),
 *    Story.message(
 *      ParentMessage.GotDragAndDropMessage({
 *        message: DragAndDrop.Message.ConfirmedKeyboardDrop(),
 *      }),
 *    ),
 *    DragAndDrop.test.settleFocus({ itemId: 'card-1' }),
 *  )
 *  ```
 */
export const settleFocus = ({ itemId }: SettleFocusInput) =>
  Story.Command.resolve(FocusItem({ itemId }), Message.CompletedFocusItem())

/** Input for {@link resolveKeyboardMove}. `itemId` is the dragged item, and
 *  `targetContainerId` and `targetIndex` are where the arrow key moves it. */
export type ResolveKeyboardMoveInput = Readonly<{
  itemId: string
  targetContainerId: string
  targetIndex: number
}>

/** Builds a group of Story steps that resolves one arrow-key move
 *  during a keyboard drag. It answers `ResolveKeyboardMove` with the given
 *  target, which the Runtime would otherwise compute from the rendered
 *  droppables, then resolves the item's `FocusItem`. Throws if either Command
 *  is missing or more than one keyboard move is pending. Other Commands
 *  returned by the parent stay pending for the story to resolve.
 *
 *  @example
 *  ```ts
 *  Story.story(
 *    update,
 *    Story.given(keyboardDraggingModel),
 *    Story.message(
 *      ParentMessage.GotDragAndDropMessage({
 *        message: DragAndDrop.Message.PressedArrowKey({
 *          direction: 'NextContainer',
 *        }),
 *      }),
 *    ),
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
  Story.steps(
    Story.Command.resolve(
      ResolveKeyboardMove,
      Message.CompletedResolveKeyboardMove({ targetContainerId, targetIndex }),
    ),
    settleFocus({ itemId }),
  )
