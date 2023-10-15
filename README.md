# perfalize

A simple way to analyze performance in JavaScript programs.

## USAGE

Install with npm

```bash
npm install perfalize
```

Use it in your program:

```js
// require() works too.
import { perfalize, enable } from 'perfalize'

// this must be enabled once somewhere
// any instrumentations in un-enabled mode are discarded
if (process.env.PROFILE === '1') {
  enable()

  // if you want to override options, you can set that here
  // only one option is supported right now, the minimum cutoff
  // (in ms). All samples with a total time below this minimum
  // will be omitted from the report.
  enable({
    // ignore any samples that didn't add up to at least this
    // many ms, defaults to 1
    minimum: 1,
  })
}

// instrument your code
// this name should be unique to each sampling hook you create
const thingDone = perfalize('do thing')
doSomething()
thingDone()

// You can also pass it a promise or async function
// and it'll collect when finished
const done = perfalize('some promise action')
const promise = someAsyncFunction(args)
done(promise)

// the done() method returns whatever is passed to it,
// so you can do this if you have some slow action in
// the tail position
function someFunction() {
  const done = perfalize('someFunction')
  doSomething()
  doSomethingElse()
  return done(doSomeSlowThing())
}

// to instrument a whole function, you can do this:
import { perfalizeFn } from 'perfalize'
const someFunction = perfalizeFn('someFunction', () => {
  doSomething()
  doSomethingElse()
  return doSomeSlowThing()
})
```

## What is Collected

The goal of any performance analysis tool should be to have as
little impact on the system under test as possible. So, not very
much is tracked, and it just does a bit of basic arithmetic on
each sample collected.

Perfalize tracks:

- number of calls (ie, the number of times that the sample name
  was triggered)
- total time spent
- mean time per sample

## Why not just use `node --prof`?

In many cases, you definitely should! I'm a huge fan. This is
somewhat of a different thing.

`node --perf` tracks _everything_ in your program, all C++ and
JS. That's ideal for coverage, and can be very useful when
you're not sure if the bottleneck is even in your code. It also
provides a "bottoms up" view that is hard to do correctly with
manual perf sampling.

But, that can also be noisy, and sometimes overkill if you just
want a simple debugging tool that you can turn on with an
enviroment variable.
