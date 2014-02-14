---
layout: post
title: Knockout catching errors
description: >
  Some helpful ways to isolate Knockout issues
modified: 2014-02-24 14:51
category: articles
tags:
  - javascript
  - knockout
  - debugging
image:
  feature: so-simple-sample-image-5.jpg
  credit: Michael Rose
  creditlink: http://mademistakes.com
comments: true
share: true
---

# What is this?

A couple tips for identifying issues with Knockout.


# Why is it important?

Error handling is one of the areas where Knockout could do with some attention. These techniques have saved me quite a bit of time, and I hope you also find them useful.


# How's it work?

There are two major places where you can really hook in and catch issues:

- Custom binding provider
- Wrapping custom bindings

The custom binding provider is called when the bindings are first made, via `ko.applyBindings`. At this point you can catch whether the binding `valueAccessor` has any errors, and check whether there are actually any binding handlers for the node's `data-bind` attribute.

The wrapping of custom bindings lets you track what is happening when a binding is being applied to a node with `binding.init` and `binding.update`. It can be tricky to track down where on the page these problems are occurring, and I add a custom class to bad nodes to highlight where bad bindings are cropping up.


## Any tools needed?

I am using [`lodash`](http://lodash.com), [`jQuery`](http://jquery.com), on Google Chrome. I am also writing the below in Coffeescript, just for my own convenience. If you are not able to use these, I hope the following is nevertheless illustrative.


##  Custom Binding Provider

This custom binding provider sends the console handy error messages
that indicate what went wrong. It also adds the class `binding-error` to the
element, highlighting which elements went awry.


{% highlight coffeescript %}
ErrorHandlingBindingProvider = ->
  # The original binding handler still does the real work; you
  # can use your own or an alternative such as knockout-secure-binding
  # here though.
  orig = new ko.bindingProvider()

  # We also pass through the `nodeHasBindings` call.
  @nodeHasBindings = orig.nodeHasBindings

  # This returns a map of binding names to respective handlers, given a node
  # and the bindingContext.
  @getBindings = (node, bindingContext) ->
    try
      # The bindings_map will be `null` if there are no bindings, otherwise
      # an object mapping { name: binding }.
      bindings_map = orig.getBindings(node, bindingContext)
    catch err
      # When there is an error, throw out some useful context.
      console.error("Binding error: ", err.message, "\nNode:", node,
        "\nContext:", ko.contextFor(node))
      $(node).addClass("binding-error")

    # Pass null straight up.
    if bindings_map == null then return null

    # If there isn't at least one good binding, print some helpful
    # debugging information.
    unless _(bindings_map).keys().any((m) -> _.has(ko.bindingHandlers, m))
      console.error("No bindings found:", bindings_map, "Node:", node)
      $(node).addClass("binding-error")
      return null

    return bindings_map
  return

# Replace the default Knockout binding provider.
ko.bindingProvider.instance = new ErrorHandlingBindingProvider()
{% endhighlight %}

As a matter of interest this started back with [Knockout issue #793](https://github.com/SteveSanderson/knockout/issues/792), with the credit for this technique owing to [Ryan Niemeyer](http://www.knockmeout.net/). Speaking
of which, while you are at it you may want to check out Ryan's post
[Knockout.js Troubleshooting Strategies](http://www.knockmeout.net/2013/06/knockout-debugging-strategies-plugin.html).


## Wrapping custom bindings

Our custom binding handlers are "wrapped" for the following purpose:

 1. make `this` into the binding object (instead of `window`);
 2. isolate any errors when `binding.init` or binding.update` are called;
 3. add class `binding-error` to any element where the binding `.init` or `.update` call fails.


{% highlight coffeescript %}
# The `isolate_call` function wraps `binding.init` and `binding.update`
isolate_call = (binding, fn_name, key) ->
  # binding is the binding object
  # fn_name is one of `init` or `update`
  # key is the name of the binding

  fn = binding[fn_name]
  unless fn then return undefined

  unless _.isFunction(fn)
    console.error("%cERROR%c Binding #{key}.#{fn_name} is not a function",
      "color:red", "color:black", binding, fn_name, fn)
    return undefined

  wrapped_fn = (args...) ->
    try
      # Pass-through the call to the original handler.
      return fn.apply(binding, args)
    catch e
      console.error("%cERROR%c: Binding #{key}.#{fn_name} error",
        "color:red", "color: black", args[0], e, e.stack)

      # args = [element, valueAccessor, allBindings, view_model, context]
      # Add a class indicating an error.
      $(args[0]).addClass("binding-error")
      return
  return wrapped_fn


isolate_binding_errors = (target, binding, key) ->

  # Expose the original binding functions.
  binding.init_fn = binding.init
  binding.update_fn = binding.update_fn

  # Add our wrapped functions.
  binding.init = isolate_call(binding, 'init', key)
  binding.update = isolate_call(binding, 'update', key)

  # Add this to the new to-be bindingHandlers object.
  target[key] = binding
  return


# Where `bindings` is a Javascript object containing our custom bindings
_.extend(ko.bindingHandlers, _.transform(bindings, isolate_binding_errors))
{% endhighlight %}

It may be worth noting that I do not wrap the built-in Knockout bindings. Though there would probably be nothing wrong with doing so, I was wary of redefining `this` on them — which ordinarily otherwise seems to just be `window`. I have been mindful of the use of `this` on my custom bindings, which I find quite convenient as one can do things like this (and beg your pardon for the tangent):

{% highlight coffeescript %}
custom_binding =
  init: (@element, @valueAccessor) ->
     @add_wrap()

  add_wrap: ->
    $(@element).wrap("<div>")
{% endhighlight %}

Which in my mind is quite a bit more concise and semantic than `custom_binding.add_wrap(@element)`. However, I am not certain whether the Knockout built-in bindings use `this` to any effect, so out of caution I do not wrap them as above.


## Styles for `binding-error`

For the `binding-error` class style I have the following visually obnoxious properties:

{% highlight css %}
/* [data-bind] */.binding-error {
  border: 4px dashed red;
  background-color: #F88;
}

/* [data-bind] */.binding-error:after {
  font-size: 16px;
  color: red;
  background-color: white;
  padding: 2px 0.5em;
  border: 1px solid gray;
  font-style: italic;
  content: "This item may not be working as expected.";
}
{% endhighlight %}

This striking visual appearance comes in handy with the *other techniques* I use to debug.

## Other techniques

When elements have the `binding-error`, I often right-click them in Chrome and click "Inspect element". This opens it up in the Developer Tools, and `$0` is set to the inspected node. The following commands are then particularly helpful:

- `ko.dataFor($0)`
- `ko.contextFor($0)`

Alternatively, there is also the helpful [Knockout Context Debugger](https://chrome.google.com/webstore/detail/knockoutjs-context-debugg/oddcpmchholgcjgjdnfjmildmlielhof).

## jsFiddle example

Here is what it looks like when you put it all together.

<iframe width="100%" height="350" src="http://jsfiddle.net/bmh_ca/sBMs2/1/embedded/result,html,js,css,resources" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## Summary

With the above techniques it becomes quite a bit simpler to root out and resolve issues with Knockout bindings. I hope you find the above helpful, and of course I would be grateful if you could please comment if you have other thoughts on debugging with Knockout.
