import { isPromise } from 'util/types'

let didOnExitPrint = false

export type Sample = {
  name: string
  count: number
  mean: number
  total: number
}

import { samples } from './samples.js'

let enabled = false
let MINIMUM: number = 1

export type Options = {
  minimum?: number
}

export const enable = (options?: Options) => {
  if (typeof options?.minimum === 'number') {
    MINIMUM = options.minimum
  }
  enabled = true
}

export const disable = () => {
  MINIMUM = 1
  enabled = false
}

export const perfalizeFn = <F extends (...a: any[]) => any>(
  name: string,
  fn: F
) =>
  enabled
    ? (...args: Parameters<F>): ReturnType<F> =>
        perfalize(name)(fn(...args))
    : fn

export const perfalize = (name: string) =>
  enabled ? startTimer(name) : nullDone

function nullDone<V extends any>(): void
function nullDone<V extends any>(v: V): V
function nullDone<V extends any>(v?: V): typeof v {
  return v
}

export const results = () =>
  Object.values(samples)
    .sort(({ total: a }, { total: b }) => b - a)
    .filter(({ total }) => total >= MINIMUM)

export const reset = () =>
  Object.keys(samples).forEach(k => delete samples[k])

export const print = () => {
  const r = results()
  if (r.length) console.error(results())
}

const startTimer = (name: string) => {
  if (!didOnExitPrint) {
    didOnExitPrint = true
    process.on('beforeExit', () => print())
  }
  const start = performance.now()
  const collect = () => {
    const end = performance.now()
    const dur = end - start
    const existing = samples[name]
    if (!existing) {
      samples[name] = {
        name,
        count: 1,
        mean: dur,
        total: dur,
      }
    } else {
      const count = existing.count + 1
      const mean = dur / count + (existing.mean * (count - 1)) / count
      const total = dur + existing.total
      samples[name] = {
        name,
        count,
        mean,
        total,
      }
    }
  }

  let calledDone = false
  function done<V extends any>(): void
  function done<V extends any>(v: V): V
  function done<V extends any>(v?: V) {
    if (calledDone) return v
    calledDone = true
    isPromise(v) ? v.finally(() => collect()) : collect()
    return v
  }
  return done
}
