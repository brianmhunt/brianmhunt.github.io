---
layout: post
title: Knockout and foreign keys
description: >
  A handy way to extend Knockout observables for storing keys.
modified: 2014-01-26 11:25:01
category: articles
tags:
  - javascript
  - knockout
  - html
  - asynchronous
image:
  feature: so-simple-sample-image-4.jpg
  credit: Michael Rose
  creditlink: http://mademistakes.com
comments: true
share: true
---

# What

An extension of [Knockout](http://knockoutjs.com/) observables, so they become
*keys* to a *model*, and that model and its loading status is added as a property to the *key* observable.

# Why

It makes some hard things easy, and some things one impossible just hard.

# How

Writing an extender for Knockout is [well documented](http://knockoutjs.com/documentation/extenders.html). This article is about extenders that I use
to make handling models via their keys easier.

I expect if you are reading this that you have some familiarity with Knockout, since this is a somewhat involved example.

Just for my own convenience, I will be using CoffeeScript.

## The `foreignKey` extender

Extend an observable to make it a key to a foreign model.

Writing a key to the observable will cause it to update the foreign key property `fk` accordingly.

### Some includes

{% highlight coffeescript %}
_ = require 'lodash'
ko = require 'knockout'
{% endhighlight %}

### Loading models

We need some way to load models from a `class_name` and `key`, and this will
vary depending on the implementation you use for models.

Given a `key` (string, id, etc.) that we use to load a class of type `class_name` and put the result into `model_obs`.

{% highlight coffeescript  %}
_load_model = (class_name, key, model_obs) ->
  # Load model of type `class_name` with key `key` into `model_obs`.
  # This can be asynchronous.
{% endhighlight %}

### The extender

Here is the code for the extender. Sorry for the length, but this creature has grown from a very simple concept to something with a bit of a life of its own.

{% highlight coffeescript %}
ko.extenders.foreignKey = (target, model_class_name) ->
  # avoid duplicate application
  if _.isObject(target.fk) then return target

  fk = target.fk =
    key: target
    is_loading: ko.observable(false)
    is_loaded: ko.observable(false)
    is_defined: ko.computed(-> Boolean(target()))
    model: ko.observable()
    model_class: model_class_name
    _on_load_callbacks: []

    attr: (attr_, default_=undefined) ->
      # We define an attr function that returns 'undefined' whenever
      # the model is not loaded.
      unless fk.is_loaded() then return default_
      return _.result(fk.model(), attr_)

    rawAttr: (attr_, default_=undefined) ->
      if fk.is_loaded()
        return fk.model()[attr_] or default_
      else
        return default_

    on_load_callback: (cb, owner) ->
      # Run the given callback when the item is loaded
      # Calls cb(model, fk)
      if owner then cb = _.bind(cb, owner)
      if fk.is_loaded()
        cb(fk.model(), fk)
      else
        @_on_load_callbacks.push(cb)
      return

  fk.is_loaded.subscribe (loaded) ->
    unless loaded then return

    # Call each of the callbacks now that the model has been loaded.
    _.each(fk._on_load_callbacks, (cb) -> cb(fk.model(), fk))
    fk._on_load_callbacks = []
    return

  _key_subscription = (key) ->
    unless key
      # Note: an empty string is saved to the db; 'undefined' is not.
      fk.model(undefined)
      fk.is_loaded(false)
      fk.is_loading(false)
      return

    unless _.isString(key)
      fk.model(undefined)
      fk.is_loaded(false)
      fk.is_loading(false)
      console.error("Bad foreignKey [#{model_class_name}]:",
        typeof(key), key)
      throw new Error("Bad foreignKey [#{model_class_name}] argument")

    # Do nothing if the item is already selected and loaded
    if fk.attr('id') == key
      return

    unless fk.is_loaded()
      fk.is_loading(true)
      # The model may have synchronously loaded from the add_callback above.
      _load_model(model_class_name, key, fk.model)
    return

  # Sometimes the model may be set directly.
  fk.model.subscribe (model) ->
    if model
      if model.id() != target() then target(model.id())
      if not fk.is_loaded()
        fk.is_loaded(true)
        fk.is_loading(false)
    else
      # We were told this model is undefined. Except as called by the
      # target.subscribe function abive, this should really only happen in
      # testing.
      # Revert to the 'loading' state.
      fk.is_loaded(false)
      fk.is_loading(true)
      # make the target null / undefined
      if target() then target('')
    return

  target.subscribe(_key_subscription)
  if target()
    # It may be worth noting that the following may synchronously call
    # both the above subscriptions (key and model) when the model is
    # already loaded for the given key (target()).
    _key_subscription(target())

  return target
{% endhighlight %}

## Properties of `fk`

Here are the properties of `fk`. Except for `model_class` they are all Knockout observables:

| Property | Provides |
|:---------|:----------|
| `fk.key` | The `target` observable i.e. the observable extended
| `fk.is_loading` | True when a key has been defined and the model is loading |
| `fk.is_loaded` | True when there is a defined key and the respective model is loaded |
| `fk.is_defined` | True when the key is defined |
| `fk.model` | The model instance, when loaded, otherwise `undefined` |
| `fk.model_class` | The name of the class, provided as an argument to the extender |

I find this is particularly well suited to the asynchronous loading of multiple models, as we will see below.

## Some examples

Let's show this with two view models, `Employee` and `Company`, as follows:

{% highlight coffeescript %}
class Employee
  constructor: ->
    @name = ko.observable()
    @company = ko.observable().extend(foreignKey: "company_model_type")

class Company
  constructor: ->
    @id = ko.observable()
{% endhighlight %}

Here is what the properties of the `company.fk` looks like before the company is defined.

{% highlight javascript %}
>>> ee.company.fk.model_class()
"company_model_type"
>>> ee.company.fk.key()
undefined
>>> ee.company.fk.model()
undefined
>>> ee.company.fk.is_defined()
false
>>> ee.company.fk.is_loading()
false
>>> ee.company.fk.is_loaded()
false
{% endhighlight %}

### Loading a model

Loading a model then becomes trivial.

{% highlight coffeescript %}
ee = new Employee()
ee.name("Sully")
ee.company("Monsters Inc")
{% endhighlight %}

Our foreignKey extender will call `_load_model` to load the Monsters Inc model.

Here's what the definitions look like after the `key` has been set but before loaded:

{% highlight javascript %}
>>> ee.company.fk.model_class()
"company_model_type"
>>> ee.company.fk.key()
"Monsters Inc"
>>> ee.company.fk.model()
undefined
>>> ee.company.fk.is_defined()
true
>>> ee.company.fk.is_loading()
true
>>> ee.company.fk.is_loaded()
false
{% endhighlight %}

When the model has loaded, which could be instant if the loading is synchronous, here is what the definitions look like:

{% highlight javascript %}
>>> ee.company.fk.model_class()
"company_model_type"
>>> ee.company.fk.key()
"Monsters Inc"
>>> ee.company.fk.model()
Company {id: "Monsters Inc", ...}
>>> ee.company.fk.is_defined()
true
>>> ee.company.fk.is_loading()
false
>>> ee.company.fk.is_loaded()
true
{% endhighlight %}

The only prerequisite is that the `_load_model` function above populates `ee.company` with the `Company` instance for Monster's Inc.

### Using a model

Knockout really shines when you get into its templating system. Suppose we
bind the `Employee` instance `ee` above to the following HTML i.e.

{% highlight coffeescript %}
  ko.applyBindings(ee, document.querySelector("#ee"))
{% endhighlight %}

The following bindings will do what is expected, with some references to the tremendous [FontAwesome](http://fontawesome.io) icon set.

{% highlight html %}
<div id='ee'>
  <h3 data-bind='text: name'></h3>
  <h4>Company</h4>
  <div data-bind='ifnot: company.fk.is_defined()'>
    <i class='fa fa-lg fa-fw fa-warning'></i> No company defined.
  </div>
  <div data-bind='if: company.fk.is_loading()'>
    <i class='fa fa-lg fa-fw fa-spin fa-spinner'></i> Please wait ...
  </div>
  <div data-bind='if: company.fk.is_loaded()'>
    <i class='fa fa-lg fa-fw fa-building-o'></i>
    <span data-bind='text: company.fk.attr("id")'></span>
  </div>
</div>
{% endhighlight %}

I find the above to be a particularly intuitive way to define how a user interface ought to appear. The logic is innocuous yet adequate.

*Caveat*: One has to be careful not to use `with: employee` since that will `ko.unwrap` the observable and we cannot then easily get at the `fk` property. I use a number of custom bindings to work around this sort of problem e.g. a `withModelFromKey`.

### Functions on `fk`

The `fk` property also supports a few functions, being:

**attr(name, default=`undefined`)**
: Return the attribute `attr` of the model, i.e. `model[name]`, if the model is loaded, or `default`. If the attribute is a function or observable, it will be called / unwrapped.

**rawAttr(name, default=`undefined`)**
: Same as `attr` but does not unwrap an observable or call a functio.

**on_load_callback(callback, owner)**
: Call `callback(model, fk)` when the model has loaded. Runs synchronously if the model is already loaded. If it is provided the `owner` argument is bound as the `this` argument to `callback`.

### Multiple keys: `foreignKeyMap`

If the value of the above is not immediately apparent, I found this particularly compelling:

Using the excellent [knockout projections](http://blog.stevensanderson.com/2013/12/03/knockout-projections-a-plugin-for-efficient-observable-array-transformations/) addon ([github](https://github.com/stevesanderson/knockout-projections)), one can map a set of keys in an `observableArray` with an extender like this `foreignKeyMap`:

{% highlight coffeescript %}
_ = require 'lodash'
ko = require 'knockout'

LOADED_THROTTLE = 15

ko.extenders.foreignKeyMap = (target, model_class_name) ->
  # No double application.
  if ko.isObservable(target.fkm) then return target

  #   fkm
  #   ~~~
  #
  #   An array of .fk properties for the target (where the target is a
  #   list of keys).
  #
  target.fkm = target.map(
    (key) -> ko.observable(key).extend(foreignKey: model_class_name).fk
  )

  #   fkm.check_is_loaded
  #   ~~~~~~~~~~~~~~~~~~~
  #
  #   Synchronously return whether all the models are loaded.
  #
  target.fkm.check_is_loaded = ->
    _.all(@(), (item) -> item.is_loaded())

  #   fkm.is_loaded
  #   ~~~~~~~~~~~~~
  #
  #   Indicate whether the all models are loaded, asynchronously.
  #
  target.fkm.is_loaded = ko.computed(
    owner: target.fkm,
    read: target.fkm.check_is_loaded
  ).extend(throttle: LOADED_THROTTLE)

  #   fkm.models
  #   ~~~~~~~~~~
  #
  #   A list of models (that are defined).
  #   Makes for easy access in KO `foreach` loops.
  #
  _fk_model = (fk) -> fk.model()
  target.fkm.models = ->
    target.fkm.filter(_fk_model).map(_fk_model)

  return target
{% endhighlight %}

With this one could define the `Company` above like this:

{% highlight coffeescript %}
class Company
  constructor: ->
    @id = ko.observable()
    @employees = ko.observableArray().extend(foreignKeyMap: "employee")
{% endhighlight %}

Populating the `@employees` property with keys will create a list of models as
`@employees.fkm.models()` that populates as-loaded.

Showing the employees of a company is done like this:

{% highlight html %}
<ul data-bind='foreach: company.employees.fkm.models()'>
  <li data-bind='text: name'></li>
</ul>
{% endhighlight %}


## Drawbacks

One might note that the granularity of the loading – one request per key – might lead to a *lot* of requests to the server. I worked around this by debouncing the requests and aggregating them into a single request i.e. instead of (conceptually) `/get?id=12341`, `/get?id=12342`, `/get?id=12343` I send `/get?ids=12341,12342,12343`.

It is also worth noting that I only deal with **string keys**. This is because for some time `dev_appserver.py` for Google App Engine (for which I developed this extender) generated keys for models that were too large for Javascript numbers. So I had to cast everything as a string. One may have to edit the `foreignKey` extender to work with numeric keys. Sorry I have not tried or otherwise accounted for this.

Also, since the above is derived from live code but is not entirely identical, it is possible I have overlooked something. Please do let me know if you encounter any issues.

## Summary

The above touches on some of the possibilities for extending Knockout. I have really found this one to be particularly handy in making other things easy. Often my models from the server contain one or more keys to other models, and this has drastically simplified the handling of those relationships.

I have found this technique co-operates very well with lazy loading. In particular, when I want to load the model for a key, I just extend the observable that contains the key with the appropriate class.

I hope the above proves interesting if not educational.
