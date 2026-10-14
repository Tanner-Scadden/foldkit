---
'@foldkit/ui': minor
---

Add `DragAndDrop.test` with Story helpers for keyboard drags. `settleFocus({ itemId })` resolves the `FocusItem` Command that a keyboard drop, a cancelled keyboard drag, or a resolved keyboard move schedules. `resolveKeyboardMove({ itemId, targetContainerId, targetIndex })` answers `ResolveKeyboardMove` with the given target and then resolves the `FocusItem` that follows. Previously every story that exercised keyboard drag resolved these internal Commands by hand, as the kanban example did at each drop. Both helpers resolve with the component's raw result Messages, so a parent that lifts the Submodel uses them unchanged. This mirrors `Toast.test.drainEntry`.
