// view.test.ts, testing view.ts
import { Lazy } from 'foldkit/test'
import { test } from 'vitest'

import { initialModel } from './main'
import { view } from './view'

// Renders the view twice with the same Model and fails if any lazy slot
// rebuilt on the second render.
test('reuses lazy views for an unchanged Model', () => {
  Lazy.expectAllReused({ view, model: initialModel })
})

// A failure lists each slot that rebuilt and why:
//
//   slot 2, key "row-1": ArgumentsChanged at index 0
//   slot 3: FunctionChanged
