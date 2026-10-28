---
'foldkit': patch
'create-foldkit-app': patch
---

Fix `Composition.makeUpdate.withContext` rejecting handler records that mix a point-free Binding operation, such as `RequestedClose: DialogBinding.requestClose()`, with a handler callback such as `PressedEnter: (model, { maybeTarget }) => ...`. TypeScript discarded the inferred record and checked every handler against the plain `{ model, commands, outMessage }` result, so a handler returning a Binding operation's result failed with "Property 'model' is missing in type 'ResultRecipe<...>'". The same record passed to `Composition.makeUpdate` compiled.

`withContext` now infers the record its factory returns as a whole and derives each handler's result from it, the same way `Definition.makeOutMessageFold` infers its handler record. Contextual handlers accept the same results as plain handlers, including Binding operation results, and the completed update has the same return type as the plain update, with the context parameters after the Model and Message.

The Update guide and the scaffolded `FOLDKIT.md` no longer recommend wrapping a Step in `model => step(model)` inside a context factory. A compatible Step, including a Binding operation, can be a contextual record value directly, as in the plain handler record.
