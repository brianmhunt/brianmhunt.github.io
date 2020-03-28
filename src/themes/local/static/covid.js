/**
 * Copyright (C) Brian M Hunt. MIT License.
 */
const root = window.root = {
  date1: ko.observable(),
  date2: ko.observable(),
  count1: ko.observable(),
  count2: ko.observable(),

  currentCases: ko.observable(1),
  doublingRate: ko.observable(4),
  startDate: ko.observable(new Date().toISOString().substr(0,10)),
  estimateDate: ko.observable(),
  
  ontExampleClick: () => setEstimate('2020-03-11', '2020-03-23', 42, 425),
  ontExample2Click: () => setEstimate('2020-03-23', '2020-03-28', 425, 993),
  nyExampleClick: () => setEstimate('2020-03-10', '2020-03-25', 173, 30811),
}

function setEstimate (date1, date2, count1, count2) {
  root.date1(date1)
  root.date2(date2)
  root.count1(count1)
  root.count2(count2)

}

root.date2.subscribe(root.startDate)
root.count2.subscribe(root.currentCases)


root.curve = ko.computed(() => {
  const { date1, date2, count1, count2 } = root
  if (!date1()) { return `Pick the first date` }
  if (!date2()) { return `Pick the second date` }
  if (!count1()) { return `Pick the first infection count` }
  if (!count2()) { return `Pick the second infection count` }
  const days = moment(date2()).diff(date1(), 'day')
  if (days === 0) { return 'Pick a different date' }
  const newCases = count2() - count1()
  if (newCases <= 0) { return 'The growth rate is not doubling' }
  const percentGrowth = count2() / count1()
  const dr = days * Math.log(2) / Math.log(percentGrowth)
  root.doublingRate(dr)
  return `${newCases} new cases in ${days} days means the number of cases will double approximately every ${dr.toFixed(2)} days.`
})


function estimate (current, doubling, daysFromNow) {
  const doubles = daysFromNow / doubling
  const count = Math.round(current * 2 ** doubles)
  const formatted = new Intl.NumberFormat().format(count)
  const date = moment(root.startDate()).add(daysFromNow, 'days').format('MMM Do, YYYY')
  return {
    daysFromNow,
    count,
    formatted,
    date,
  }
}

root.estimates = ko.computed(() => {
  return [
    estimate(root.currentCases(), root.doublingRate(), 2),
    estimate(root.currentCases(), root.doublingRate(), 5),
    estimate(root.currentCases(), root.doublingRate(), 7),
    estimate(root.currentCases(), root.doublingRate(), 14),
    estimate(root.currentCases(), root.doublingRate(), 30),
    estimate(root.currentCases(), root.doublingRate(), 60),
    estimate(root.currentCases(), root.doublingRate(), 90),
    estimate(root.currentCases(), root.doublingRate(), 120),
    estimate(root.currentCases(), root.doublingRate(), 365),
  ].filter(e => e.count < 1000000000)
})

root.chosenEstimate = ko.computed(() => {
  if (!root.estimateDate()) {
    return 'Choose an estimate date to predict the cases on a given date.'
  }
  const days = moment(root.estimateDate()).diff(root.startDate(), 'days')
  if (days <= 0) {
    return 'The estimate date must be after the start date.'
  }
  const e = estimate(root.currentCases(), root.doublingRate(), days)
  return `Estimate: ${e.formatted} cases.`
})

ko.applyBindings(root)
