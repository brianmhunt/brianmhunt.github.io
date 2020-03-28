---
date: "2016-03-15T00:00:00Z"
title: Debugging Deep Promises
---

# The Problem

Promises are arguably the best mechanism we have for dealing with
asynchronous software development, and many folks use them heavily in
Javascript.

Promises nonetheless can be problematic to debug.  One particularly
pernicious problem is “bleeding” of promises from one test to another.


## Problem Example

Parallel promises, i.e. not those chained by `.then`, are resolved in an
indeterminate order.

A contrived but illustrative scenario:

```javascript
Promise.resolve().then(aFn).then(() => console.log('a'))
Promise.resolve().then(bFn).then(() => console.log('b'))
```

For some arbitrary `aFn` and `bFn`, there is no way to tell the order that
the letters `'a'` and `'b'` will be printed in.  Even where timing seems
consistent, the result may arbitrarily and unpredictably fail.

To some extent, one can design around the problem, but in a sufficiently complex
system such designs can become impractical and add substantial complexity.

While in many systems the vast majority of Promises can be left dangling,
where they do cause interference in subsequent testing the time lost to
isolating and debugging can be onerous.


## Effect on Testing

The problem of "bleeding" occurs when a promise is started in one test, but
finishes in another. This can pollute the results.

For the most part, the problem comes in two forms:

  1. "fire and forget" branches
  2. complex dependency nesting

In the first case, a promise is created that is not merged (with `.all`) or
chained, and so there may be no easy way to track it.  In the second, the
nested dependency may not be anticipated, or merging it may be more
trouble than the benefit.

The problem can often exhibit as sporadic failures without apparent cause
or consistency.

Here's an example testing, with mocha + chai:


```javascript
global.side_effect = 0

function alpha() {
  var fireAndForget = Promise.resolve().then(() => side_effect = 'b')
  return Promise.resolve().then(() => side_effect = 'a')
}

describe("an asynchronous thing", function () {
  it("has no side_effect initially", function () {
    return alpha().then(() => assert.equal(side_effect, 'a'))
  })
})
```

Since the promise resolution order is non-deterministic, the above may pass or
fail, unpredictably.

Below, we'll see how we can inform our testing and design to expose the
fire-and-forget promises.

In addition to the above test failing at random, the failures may also exhibit
in tests that rely on `side_effect` *subsequent to* the above test completing.

If you have thousands of tests, this can be more than unwieldy - it can be a
rabbit-hole in your development, tracking down the origin of a wayward
promise.


# Introducing MutexPromise

To help resolve the problem, I wrote [MutexPromise](https://github.com/brianmhunt/MutexPromise).  It is an
A+ Promise compliant implementation, and hopefully compatible with ES-262,
so it can be dropped into most basic-promise scenarios.

MutexPromise offers a few tools to help with debugging promises:

- Events: `new`, `reject`, `resolve`, `uncaught`, `trespass` that trigger for all promises;
- Temporal mutual exclusion: a `trespass` event is emitted when a promise is resolved outside its "mutex";
- Uncaught checking: An `uncaught` event is emitted when a promise does not have a `catch` chained to it soon after construction;
- Creation and chaining call stacks: Stack traces from the point of creation, so one can see where the promise originated.

Together these have dramatically reduced our "promise bleed" and unwanted,
difficult to isolate asynchronous side effects.


## Sample Usage — Tracking Unresolved Promises

There are a number of ways to use MutexPromise, but one of the most valuable I
have found is to keep a list of promises started in a test and throw
exceptions for any promises unresolved after testing completes.

For example, in a node-ish environment with mocha + chai:


```javascript
var promiseMap = new Map()
var current_test_name = "Tests have not yet started."

global.Promise = require('brianmhunt-mutex-promise/dist/MutexPromise')

global.Promise.on('new', function () {
  if (!current_test_name) {
    throw new Error("Attempted to create a promise outside tests.")
  }
  this.startedDuringTest = current_test_name
  var pSet = promiseMap.get(current_test_name)
  if (!pSet) {
    pSet = []
    promiseMap.set(current_test_name, pSet)
  }
  pSet.push(this)
})

beforeEach(function () {
  current_test_name = this.currentTest.fullTitle()  // the mocha test name.
})

afterEach(function () {
  var unresolvedPromises = _.filter(
    promiseMap.get(current_test_name) || [], (p) => !p.state
  )
  if (unresolvedPromises.length) {
    console.log(
      `Unresolved promises (${unresolvedPromises.length})`,
      unresolvedPromises
    )
    throw new Error("There are unresolved promises.")
  }
})

```

Whenever a test has some unresolved promises, the exception is thrown, and it is easy to track down where those promises started by looking at the
`creationStack` property of the unresolved promises.

A key advantage to the above technique is that it will often be deterministic,
in the sense that any asynchronous behaviours created by promises
will be revealed more consistently than aberrant failures resulting from
bleeding that occurred sometime before the creation.
We catch them at the gate, so to speak.

This does not capture other forms of asynchronicity, such as `debounce`,
`throttle`, `setTimeout`, `setInterval`, or otherwise – so one has to capture
those scenarios by using a Promise-equivalent or an alternative system
of tracking.


## Caveat – Not for Production

As it was designed with debugging and testing in mind, I would steer clear of
using MutexPromise in production.

It is quite memory and time-intensive compared to alternatives.

Using the events of the MutexPromise would be an anti-pattern.


# Conclusion

Using MutexPromise to track down bleeding promises has substantially
improved productivity and lost time to debugging, and I hope you find it
useful too.

If you can think of any ways to improve MutexPromise, feel free to comment
or [start an issue over on Github](https://github.com/brianmhunt/MutexPromise/issues).
