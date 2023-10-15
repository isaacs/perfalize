import t from 'tap'
import {
  enable,
  disable,
  perfalize,
  perfalizeFn,
  print,
  reset,
  results,
} from '../src/index.js'

t.afterEach(reset)

const errs = t.capture(console, 'error').args

t.test('not enabled, no-op', t => {
  const fn = () => {}
  t.equal(fn, perfalizeFn('no-op function instrument', fn))
  const done = perfalize('no-op sample')
  done()
  t.strictSame(results(), [])
  print()
  t.strictSame(errs(), [])
  t.end()
})

t.test('alize some perf', async t => {
  enable({ minimum: -1 })
  const done = perfalize('sample')
  const fn = async () => {}
  const p = perfalizeFn('function instrument', fn)
  t.not(p, fn, 'returned different function')
  await Promise.all([p(), p()])
  done()
  // no-op
  done()
  const res = results()
  t.match(
    new Set(res),
    new Set([
      { name: 'sample', mean: Number, total: Number, count: 1 },
      {
        name: 'function instrument',
        mean: Number,
        total: Number,
        count: 2,
      },
    ])
  )
  t.ok((res[0]?.total ?? -1) >= (res[1]?.total ?? 0), 'sorted')
  print()
  t.equal(errs().length, 1)
  disable()
  t.equal(fn, perfalizeFn('no-op again', fn))
  t.end()
})
