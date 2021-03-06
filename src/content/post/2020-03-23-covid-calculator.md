---
date: "2020-03-23T00:00:00Z"
title: COVID Exponential Growth Estimator
---

<link href="/css/covid.css" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/knockout/3.5.1/knockout-latest.js" integrity="sha256-6JV7sYKlBHsHvqCkn9IrEWFLGrmsW4KG/LIln0hljnM=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment-with-locales.min.js" integrity="sha256-AdQN98MVZs44Eq2yTwtoKufhnU+uZ7v2kXnD5vqzZVo=" crossorigin="anonymous"></script>

The following is a calculator that can be used to make
estimates about the exponential growth phase of the COVID pandemic.

It is purely a mathematical estimator, and has no underlying insight into the
disease growth patterns, but can be used as an informational tool for projecting
and observing patterns.

## Calculate Growth Rate

Enter two dates where the number of cases is known, and the respective number
of cases, then the result will be shown.

Some examples:
- <a href='#' data-bind='click: nyExampleClick'>New York Mar 10, 2020: 173 cases => Mar 25: 30811 cases</a> indicates a doubling rate of 2.01 days, however the numbers recorded on the 27th (44,635) indicate a doubling rate of closer to 3, meaning the growth is slowing.
- <a href='#' data-bind='click: ontExampleClick'>Ontario Mar 11, 2020: 42 cases => Mar 23: 425 cases</a> indicates a doubling rate of 3.59 days.  
- <a href='#' data-bind='click: ontExample2Click'>Ontario Mar 23, 2020: 425 cases => Mar 28: 994 cases</a> indicates a doubling rate of 4.08 days, suggesting that the doubling rate is slowing.


<div class='covid-rate-grid'>
  <span>First date</span>
  <input type='date' data-bind='value: date1'/>
  <input type='number' placeholder='Cases' data-bind='textInput: count1'>
  <span>Second date</span>
  <input type='date' data-bind='value: date2'/>
  <input type='number' data-bind='textInput: count2'>
  <span>Result</span>
  <span class='covid-rate-result' data-bind='text: curve'></span>
</div>

The start date and the second cases will be automatically copied into the
estimate below.


## Estimate future cases

Enter the start date, the current number of cases, and number of days
the cases double, and estimates will be calculated in a table.

<div class='covid-estimate-grid'>
  <span>Start Date</span>
  <input type='date' data-bind='value: startDate' />
  <span>Starting Date Cases</span>
  <input type='text' data-bind='textInput: currentCases' />
  <span>Days to Double</span>
  <input type='text' data-bind='textInput: doublingRate' />
  <em>Estimate Date</em>
  <input type='date' data-bind='value: estimateDate' />
  <span class='covid-estimate' data-bind='text: chosenEstimate'></span>
  <div class='covid-estimates'>
    <b>Days</b>
    <b>Date</b>
    <b>Estimated cases</b>
    <!-- ko foreach: estimates -->
      <span style='text-align: right' data-bind='text: daysFromNow'></span>
      <span data-bind='text: date'></span>
      <span data-bind='text: formatted'></span>
    <!-- /ko -->
  </div>
</div>

Of course these estimates are inaccurate in the very-short term, and
they become wildly inaccurate in the very-long term because the exponential
growth rates quickly exceed the global human population, and the speed
at which the disease propagates leaves an exponential growth phase.

### Formulas



The doubling rate is calculated with:

<code class='covid-formula'>
  days &times; log<sub>n</sub>(2) / log<sub>n</sub>(count<sub>2</sub> / count<sub>1</sub>)
</code>

being a <a href='https://en.wikipedia.org/wiki/Doubling_time'>doubling time</a> formula.

The estimate of future cases follows the formula:

<code class='covid-formula'>
  cases &times; 2<sup>days / days-to-double</sup>
</code>

The estimates stop at 1 billion or 365 days.


<script src="/covid.js"></script>
