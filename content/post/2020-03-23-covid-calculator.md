---
date: "2020-03-23T00:00:00Z"
title: COVID Exponential Growth Estimator
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

<div data-bind='foreach: estimates'>
  <div>
    <span data-bind='text: daysFromNow'></span> day:
    <span data-bind='text: formatted'></span>
  </div>
</div>
Hello, world.

<script src="/covid.js"></script>
