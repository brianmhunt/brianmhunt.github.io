const root = window.root = {
  currentCases: ko.observable(1),
  doublingRate: ko.observable(4),
  startDate: ko.observable(new Date().toISOString().substr(0,10)),
}

function estimate (current, doubling, daysFromNow) {
  const doubles = daysFromNow / doubling
  const count = Math.round(current * 2 ** doubles)
  const formatted = new Intl.NumberFormat().format(count)
  return { daysFromNow, count, formatted }
}

root.estimates = ko.computed(() => {
  console.log(`
    current: ${root.currentCases()}
    doubling: ${root.doublingRate()}
    start: ${root.startDate()}
  `)

  return [
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
})

ko.applyBindings(root)
