import { Array, Context, Effect, Match, pipe } from 'effect'

import {
  __beginRender as beginHtmlRender,
  __clearRuntime as clearHtmlRuntime,
  __createBoundaryRegistry as createHtmlBoundaryRegistry,
  __htmlBuilder as htmlBuilderFor,
  __setRuntime as setHtmlRuntime,
} from '../html/index.js'
import type { Document, Html, HtmlBuilder } from '../html/index.js'
import {
  type LazyMissReason,
  type LazyResolution,
  observeLazyResolutions,
} from '../html/lazy.js'
import { MountTracker } from '../mount/index.js'
import { Dispatch } from '../runtime/dispatch.js'

export type { LazyMissReason }

/** One lazy slot that rebuilt its view on the second render. `slotId` numbers
 *  the `createLazy` and `createKeyedLazy` instances in the order the second
 *  render reached them, starting at 1, so it identifies a slot within one
 *  report only. `key` is present for keyed slots. */
export type LazyMiss = Readonly<{
  slotId: number
  key?: PropertyKey
  reason: LazyMissReason
}>

const noOpDispatch = Dispatch.of({
  dispatchAsync: () => Effect.void,
  dispatchSync: () => {},
})

const lazyContext = Context.make(Dispatch, noOpDispatch).pipe(
  Context.add(MountTracker, {
    started: () => {},
    ended: () => {},
  }),
)

const formatKey = (key: PropertyKey): string =>
  typeof key === 'string' ? JSON.stringify(key) : String(key)

const formatReason = (reason: LazyMissReason): string =>
  Match.value(reason).pipe(
    Match.tagsExhaustive({
      NoCachedEntry: () => 'NoCachedEntry',
      FunctionChanged: () => 'FunctionChanged',
      FrameChanged: () => 'FrameChanged',
      ArgumentCountChanged: ({ previousCount, currentCount }) =>
        `ArgumentCountChanged from ${previousCount} to ${currentCount}`,
      ArgumentsChanged: ({ indices }) =>
        `ArgumentsChanged at index ${indices.join(', ')}`,
    }),
  )

const formatMiss = ({ slotId, key, reason }: LazyMiss): string =>
  key === undefined
    ? `  slot ${slotId}: ${formatReason(reason)}`
    : `  slot ${slotId}, key ${formatKey(key)}: ${formatReason(reason)}`

const REASON_HINTS: Record<LazyMissReason['_tag'], string> = {
  NoCachedEntry:
    'NoCachedEntry: the slot had nothing cached for this key from the first ' +
    'render. Create createLazy and createKeyedLazy slots at module scope, not ' +
    'inside the view, and key keyed slots by a stable id from the Model.',
  FunctionChanged:
    'FunctionChanged: the slot received a different view function. Pass a ' +
    'module-level function instead of an inline arrow or a function built ' +
    'during the view.',
  FrameChanged:
    'FrameChanged: the slot ran under a different dispatch frame. Give each ' +
    'Submodel boundary its own slot or key.',
  ArgumentCountChanged:
    'ArgumentCountChanged: the args array had a different length. Pass a ' +
    'fixed set of arguments.',
  ArgumentsChanged:
    'ArgumentsChanged: the arguments at those indices are new references for ' +
    'the same Model. Pass Model values directly instead of objects, arrays, ' +
    'or closures built during the view.',
}

const formatFailure = (misses: ReadonlyArray<LazyMiss>): string => {
  const hints = pipe(
    misses,
    Array.map(({ reason }) => reason._tag),
    Array.dedupe,
    Array.map(tag => `  ${REASON_HINTS[tag]}`),
  )
  const count =
    misses.length === 1 ? '1 lazy slot' : `${misses.length} lazy slots`
  return [
    `Expected every lazy slot to reuse its cached view when the same Model ` +
      `renders twice, but ${count} rebuilt:`,
    '',
    ...Array.map(misses, formatMiss),
    '',
    ...hints,
  ].join('\n')
}

/** Renders `view` twice with the same `model` and throws if any `createLazy`
 *  or `createKeyedLazy` slot rebuilds its view on the second render. Both
 *  renders share one dispatch frame, so a miss means the view itself hands
 *  the slot a new function or new arguments, or creates the slot during the
 *  render. The error lists each miss with its slot, key, and reason.
 *
 *  Also throws if the view renders no lazy slots, since the assertion would
 *  then pass without checking anything.
 *
 *  ```ts
 *  import { Lazy } from 'foldkit/test'
 *
 *  test('reuses lazy views for an unchanged Model', () => {
 *    Lazy.expectAllReused({ view, model: initialModel })
 *  })
 *  ```
 */
export const expectAllReused = <Model, Message>(
  config: Readonly<{
    view: (model: Model, h: HtmlBuilder<Message>) => Html | Document
    model: Model
  }>,
): void => {
  const { view, model } = config
  const registry = createHtmlBoundaryRegistry()
  const render = (): void => {
    beginHtmlRender(registry)
    setHtmlRuntime(noOpDispatch.dispatchSync, lazyContext, registry)
    try {
      view(model, htmlBuilderFor<Message>())
    } finally {
      clearHtmlRuntime()
    }
  }

  render()

  const resolutions: Array<LazyResolution> = []
  observeLazyResolutions(resolution => {
    resolutions.push(resolution)
  }, render)

  if (resolutions.length === 0) {
    throw new Error(
      'Expected the view to render at least one lazy slot, but it rendered ' +
        'none. Check that this Model reaches the createLazy or ' +
        'createKeyedLazy calls under test.',
    )
  }

  const slotIds = new Map<object, number>()
  const misses = Array.flatMap(
    resolutions,
    ({ slot, key, missReason }): ReadonlyArray<LazyMiss> => {
      const slotId = slotIds.get(slot) ?? slotIds.size + 1
      slotIds.set(slot, slotId)
      if (missReason === undefined) {
        return []
      }
      return [
        key === undefined
          ? { slotId, reason: missReason }
          : { slotId, key, reason: missReason },
      ]
    },
  )

  if (Array.isReadonlyArrayNonEmpty(misses)) {
    throw new Error(formatFailure(misses))
  }
}
