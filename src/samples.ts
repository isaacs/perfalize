import type { Sample } from './index.js'

// stash on the global so that cjs and esm use the same set
const kSamples = Symbol.for('perfalize.samples.0')
const g = globalThis as typeof globalThis & {
  [kSamples]?: Record<string, Sample>
}
export const samples: Record<string, Sample> =
  g[kSamples] ?? Object.create(null)
g[kSamples] = samples
