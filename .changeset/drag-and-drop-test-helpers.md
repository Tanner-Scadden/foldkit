---
'@foldkit/ui': minor
---

Add `DragAndDrop.test` with Story helpers for keyboard drags. `settleFocus({ itemId })` resolves the `FocusItem` Command that a keyboard drop, cancel, or resolved keyboard move returns. `resolveKeyboardMove({ itemId, targetContainerId, targetIndex })` answers `ResolveKeyboardMove` with the given target and then resolves the item's focus. Both helpers require the expected Commands and leave unrelated parent Commands for the story to resolve. `resolveKeyboardMove` rejects multiple pending moves. The helpers replay the Command's recorded Message wrapping, so a parent that lifts the Submodel uses them unchanged.
