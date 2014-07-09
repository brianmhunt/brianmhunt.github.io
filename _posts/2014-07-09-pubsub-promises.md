---
layout: post
title: Knockout observables and Promises
description: >
  Helping Promises and the Knockout publish/subscribe system get along.
modified: 2014-07-09 11:00:00
category: articles
tags:
  - javascript
  - promises
  - knockout
image:
  feature: so-simple-sample-image-5.jpg
  credit: Michael Rose
  creditlink: http://mademistakes.com
comments: true
share: true
---


# What is it?

This is just a few notes about using [Knockout](http://knockoutjs.com)
observables with
[ES6 Promises](http://www.html5rocks.com/en/tutorials/es6/promises/).


# Why is it important?

The concepts here are reusable ways for promises and pub/sub systems to
interact in a healthy way.

Publish and subscribe and promises are two canonical, widely-supported
methods of handling asynchronous flow. The ease at which they communicate
with each other makes asynchronicity easier to handle.


# Promises to observables

Publishing to an observable when a promise completes is trivial. For example,
given a promise `promise` and an observable `obs`:

{% highlight javascript %}
  promise.then(obs)
{% endhighlight %}

When the promise completes it passes the value to the observable.


# `resolve_when` something is published

When something is published, one often wants to fulfill a promise (once). Here
is a way to do that.

Here is the scenario. You have an observable `obs`, you want to do something
when it is given (or has) a value or meets a test. Like this:

{% highlight javascript %}
resolve_when(obs).then(do_something);
{% endhighlight %}

or an arbitrary test

{% highlight javascript %}
function test(t) {
  return t == 'value'
}
resolve_when(obs, test).then(do_something);
{% endhighlight %}

Here is a jsFiddle in Coffeescript with a function,
`resolve_when` that accomplishes this:

<iframe width="100%" height="300"
  src="http://jsfiddle.net/bmh_ca/7KLPc/3/embedded/"
  allowfullscreen="allowfullscreen" frameborder="0"></iframe>

For convenience, here is an equivalent `resolve_when` function in Javascript:

{% highlight javascript %}
function resolve_when(obs, test) {
  if (!test) {
    test = function (t) { return Boolean(t) }  
  }
  if (test(obs()) { return Promise.resolve(obs); }
  return new Promise(function (resolve) {
    var subs = obs.subscribe(function(v) {
      if (test(v)) {
        resolve(obs);
        subs.dispose();
      }
    });
  });
}
{% endhighlight %}

# Conclusion

Of course this just scratches the surface, but I find myself integrating
this particular promise regularly.

I hope you find the above useful, and please feel free to comment.
