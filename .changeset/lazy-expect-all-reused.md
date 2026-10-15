---
'foldkit': minor
---

Add `Lazy.expectAllReused` to `foldkit/test` for checking that `createLazy` and `createKeyedLazy` slots actually reuse their cached views. A lazy view that misses its cache still renders correctly, so a slot created inside the view, an inline view function, or an argument rebuilt on every render used to go unnoticed until the page got slow.

`Lazy.expectAllReused({ view, model })` renders the view twice with the same Model under one dispatch frame and fails if any slot rebuilt on the second render. The error lists each miss with its slot, its key for keyed slots, and a reason: `NoCachedEntry`, `FunctionChanged`, `FrameChanged`, `ArgumentCountChanged`, or `ArgumentsChanged` with the argument indices that changed. It also fails when the view renders no lazy slots, so a Model that never reaches the memoized views cannot pass by accident.

```ts
import { Lazy } from 'foldkit/test'

test('reuses lazy views for an unchanged Model', () => {
  Lazy.expectAllReused({ view, model: initialModel })
})
```

Live renders keep the same cache comparison. Miss reasons are only computed while the test helper observes a render.
