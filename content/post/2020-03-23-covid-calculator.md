---
date: "2020-03-23T00:00:00Z"
title: COVID Calculator
---

I had posted my accurate estimations to friends and colleagues on Facebook, but
that post seems to have disappeared, so I thought I would simply post a simple
version of the calculator here.

<script src="https://cdnjs.cloudflare.com/ajax/libs/knockout/3.5.1/knockout-latest.js" integrity="sha256-6JV7sYKlBHsHvqCkn9IrEWFLGrmsW4KG/LIln0hljnM=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment-with-locales.min.js" integrity="sha256-AdQN98MVZs44Eq2yTwtoKufhnU+uZ7v2kXnD5vqzZVo=" crossorigin="anonymous"></script>

### Estimate future cases

Start Date: <input type='date' data-bind='value: startDate' />

Starting Date Cases: <input type='text' data-bind='textInput: currentCases' />

Days to Double: <input type='text' data-bind='textInput: doublingRate' />


Hello, world.

<script>
const root = window.root = {
  currentCases: ko.observable(1),
  doublingRate: ko.observable(4),
  startDate: ko.observable(new Date().toISOString().substr(0,10)),
}

function estimate (current, doubling, daysFromNow) {
  console.log(`daysFromNow`, daysFromNow, doubling)
  const doubles = daysFromNow / doubling
  console.log(`current`, current, doubles)
  return current * 2 ** doubles
}

root.estimation = ko.computed(() => {
  console.log(`
    current: ${root.currentCases()}
    doubling: ${root.doublingRate()}
    start: ${root.startDate()}
  `)

  const estimations = [
    estimate(root.currentCases(), root.doublingRate(), 1),
    estimate(root.currentCases(), root.doublingRate(), 2),
    estimate(root.currentCases(), root.doublingRate(), 7),
    estimate(root.currentCases(), root.doublingRate(), 14),
    estimate(root.currentCases(), root.doublingRate(), 30),
    estimate(root.currentCases(), root.doublingRate(), 60),
    estimate(root.currentCases(), root.doublingRate(), 90),
    estimate(root.currentCases(), root.doublingRate(), 120),
    estimate(root.currentCases(), root.doublingRate(), 365),
  ]

  console.log(`estimations`, estimations)

  return '?'
})

ko.applyBindings(root)
console.log(`Bindings applied`)
</script>
