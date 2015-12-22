---
layout: post
title: Knockout beats raw Javascript (and other frameworks too)
date: "2015-12-22 12:37"
---

A while back I noted and commented on [React vs AngularJS vs KnockoutJS: a Performance Comparison](https://www.codementor.io/reactjs/tutorial/reactjs-vs-angular-js-performance-comparison-knockout).  I wondered at that time how my Knockout plugin [knockout-fast-foreach](https://github.com/brianmhunt/knockout-fast-foreach) would compare.

Paul Huizer recently asked [if I had put together a test with fast-foreach](https://disqus.com/home/discussion/codementorio/reactjs_vs_angularjs_vs_knockoutjs_a_performance_comparison_51/#comment-2421302313).  I had not, but I thought this was a good time to give it a whirl.  So I copied [Chris Harrington's test](https://github.com/chrisharrington/demos/blob/gh-pages/performance/index.html) and replaced Knockout's `foreach` binding with `fastForEach`.

The results are favourable.  Knockout-fast-foreach looks to be an order of magnitude faster than raw Javascript, and similarly magnitudes faster than React and Angular.

Here are some results of the test that [Chris Harrington put together, with fast-foreach](/chrisharrington-performance.html):

|         | Knockout | React | Angular | Raw  |
|:-------:|---------:|------:|--------:|-----:|
| Average | **4ms**  | 53ms  | 151ms   | 70ms |
| Low     | **1ms**  | 45ms  | 121ms   | 56ms |


I ran these on Chrome 48 on a Late-2012 Macbook Pro with OS X 10.11.2.
