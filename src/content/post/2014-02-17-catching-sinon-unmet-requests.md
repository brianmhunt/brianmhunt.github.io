---
comments: true
date: "2014-02-17T00:00:00Z"
description: |
  Figure out when Sinon.JS does not respond to a request
image:
  credit: Michael Rose
  creditlink: https://mademistakes.com
  feature: so-simple-sample-image-3.jpg
modified: "2014-02-17 11:25:01"
share: true
tags:
- unit tests
- sinon.js
title: Catching Sinon Unmet Requests
---

# What is it?

Track AJAX requests that have not been responded to by the [Sinon.JS](https://github.com/cjohansen/Sinon.js) fake XMLHttpRequest server.


# Why is it important?

It can be difficult to figure out whether a request has been responded to. Figuring it out can be time consuming and troublesome. This method catches everything.


# How do we do it?

I am using [Mocha](https://visionmedia.github.io/mocha/) and [Chai](https://chaijs.com/), but this should work as well with other frameworks' equivalent hooks.

I use a global `xhr_server` variable to create the Sinon.js server like this:

{{< highlight coffeescript >}}
  xhr_server = sinon.fakeServer.create()
{{< / highlight >}}

Because I want to capture every AJAX request I do not put this into a `before`
or `beforeEach` with matching restoration in `after`/`afterEach`. Any AJAX request made on my testing page ought to be intercepted by the fake server.

So after every test one can check the Sinon.js `queue` that tells us what requests were made:

{{< highlight coffeescript >}}
  afterEach ->
    if xhr_server.queue
      # Print something that tells us what's happening.
      console.log("Unmet Requests:",
        xhr_server.queue.map((m) -> m.url).join(", ")
      )
      xhr_server.queue.length = 0
    if xhr_server.responses
      xhr_server.responses.length = 0
{{< / highlight >}}

Note that we empty the server responses and queue for the next test.

Now whenever a request is unmet, we get:

```
>>> Unmet Requests: /test_url /test_url_2
```

## Caveats

There are two caveats to this strategy. First, we cannot match the test that calls `afterEach` to the request. The queue may contain requests made by latent asynchronous calls generated in a prior test. I am not certain this is a solvable problem.

Second, and in a related vein, if any request is made after all the tests are complete those requests will not be printed to the screen.

One can solve this latter problem by changing the `xhr_server.xhr.onCreate` callback after the test-runner completes.  For example:

{{< highlight coffeescript >}}
mocha.run(->
   xhr_server.xhr.onCreate = (req) ->
    console.error("XHR request made to #{req.url} after tests.",
      req)
)
{{< / highlight >}}


# Summary

This is just a little trick to rein in and tame what can be a wild asynchronous world. I find it quite helpful, and hope you find it valuable.
