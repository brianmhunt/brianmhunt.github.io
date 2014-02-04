---
layout: post
title: Knockout Secure Binding
description: >
  KSB is a drop-in binding provider for Knockout that does not violate a
  Content Security Policy that prohibs eval.
modified: 2014-02-04 11:25:01
category: articles
tags:
  - javascript
  - knockout
image:
  feature: so-simple-sample-image-2.jpg
  credit: Michael Rose
  creditlink: http://mademistakes.com
comments: true
share: true
---

# What is it?

[Knockout Secure Binding](https://github.com/brianmhunt/knockout-secure-binding)
is a [custom binding provider](http://www.knockmeout.net/2011/09/ko-13-preview-part-2-custom-binding.html) for [Knockout](http://knockout.js.com).

# Why does it matter?

The regular binding provider calls `new Function`, which throws an exception
when you have a Content Security Policy that prohibits `unsafe-eval`.

These security policies are mandatory in some circumstances, such as Chrome Web Apps.

# How does it work?

At its core, KSB is two things:

1. A parser that interprets `data-bind` attributes on the DOM elements and text of virtual elements that Knockout reads; and

2. A process for converting the values produced by the parser into the `valueAccessor` argument that is given to Knockout bindings.

Knockout's built-in and [custom](http://knockoutjs.com/documentation/custom-bindings.html) bindings are objects with at least one of two function-properties: `init` and `update`. These functions have the same set of arguments, with the first being the DOM `element` to which the binding is bound and the second the `valueAccessor` that looks up the value given to the binding in the `data-bind` attribute (or similarly for virtual elements).

A typical binding looks like this:

{% highlight javascript %}
ko.bindingHandlers.custom_binding = {
    init: function(element, valueAccessor, allBindings,
                   viewModel, bindingContext)
    { /* ... */ }
    update: function(element, valueAccessor, allBindings,
                     viewModel, bindingContext)
    { /* ... */ }
};
{% endhighlight %}

The binding is then implemented like this:

{% highlight html %}
  <div data-bind='custom_binding: "hello " + name'></div>
{% endhighlight %}

When Knockout's `applyBindings` is called it will call the `custom_binding.init` function with the `<div>` above as the first argument and the `valueAccessor` as the second argument.

The `valueAccessor` is provided by a binding provider such as KSB. Below is how it is implemented.

## Setting a custom binding provider

Setting the binding provider in Knockout to KSB:

{% highlight javascript %}
ko.bindingProvider.instance = new ko.secureBindingsProvider(options);
{% endhighlight %}

The `options` parameter is an object passed into the binding constructor. Note that `ko.secureBindingsProvider` by default will use the attribute `data-sbind`. One can override this by passing `attribute: 'data-bind'` in the options.

Once a custom provider is set, when `ko.applyBindings is called` Knockout calls two functions from the provider: `nodeHasBindings` and `getBindingAccessors`.

The `nodeHasBindings` does as named, and returns truthy when a node has a binding that the custom binding provider recognizes. In the usual course this would be a DOM node with a `data-bind` (or `data-sbind`) property. If the node is a virtual element then KSB always returns `true` because Knockout virtual elements are pre-filtered by an immutable regular expression.

After the nodes have been determined to have bindings, the `getBindingsAccessors` is called on nodes with the bindings. It is passed as arguments the `node` and the `context`. It is here that the KSB parser is called, and this function returns a map of binding names to the respective `valueAccessor` functions that will be passed as arguments to `binding.init` and `binding.update`.

So the call will be given the node and the `$context`, with something like this:

{% highlight javascript %}
getBindingsAccessors(<div data-bind='text: abc'>,
                     { $data: { abc: "value" } })
{% endhighlight %}

which will return an object like this:

{% highlight javascript %}
{ abc: function valueAccessor() { return "value" } }
{% endhighlight %}

When a binding `init` or `update` calls its `valueAccessor()` argument it will get `"value"`.


## The parser

As parsers go KSB recognizes essentially a superset of JSON that includes identifiers and expressions. If one were to describe it in a [BNF](http://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form)-like way it would basically look something like this:

~~~
native      ::= Object | Array | string | number | true | false |
                undefined | null
value       ::= <identifier> | <expression> | <native>
operator    ::= "+" | "-" | "*" | "/" | "%" | "!" | "&" | "||" | "&&" |
                "&" | "|" | "^" | "==" | "===" | "!==" | "!===" | "<" |
                "<=" | ">" | ">="
name        ::= [A-Za-z_0-9$]+
dereference ::= "()" | "[" + <value> + "]"
identifier  ::= <name> + <dereference>* + ("." + <identifier>)?
unary       ::= ("!" | "!!" | "~") + <identifier>
expression  ::= (<value> + <operator> | <unary>)? + <value>
binding     ::= <name> + ":" + <value> + ("," + <binding>)?
~~~


When run on the contents of a `data-bind` attribute the parser will produce an
object that maps the binding names to values. Those values may be a primitive, an array, an object, a function, an `Identifier` or an `Expression`. A primitive is one of Javascript's native variable types, namely a number, string, `true`, `false`, `undefined` or `null`.

The parser is originally based on Douglas Crockford's [json_parse.js](https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js).


## Native values

An example of values that are not Identifiers or Expressions (i.e. "native" variable types):

{% highlight html %}
<div data-bind='binding1: "number",
                binding2: -2.4,
                binding3: [1, 2, a, 1 + 3, a()[4]],
                binding4: { a: 123, b: a, c: 1 + 3 }'></div>
{% endhighlight %}

Note that when an array or an object is returned its members need not necessarily be primitives. They may be Identifiers or Expressions, which are calculated when read.

When a primitive, object or array is returned, it is wrapped in a function, like this: `function constAccessor () { return value }`. This function becomes `valueAccessor`. Wrapping like this is not necessary for the other types of values (`Identifier` and `Expression`) because they are already functions.

## Identifiers

Instead of a native value type, the parser may produce an Identifier. Here are some examples:

{% highlight html %}
<div data-bind='binding1: a,
                binding2: a.b.c,
                binding3: a().b[4].d()'></div>
{% endhighlight %}

When parsed the Identifiers are converted into a `lookup` name and an array of *dereferences*.

The lookup is a name of the variable, which in the above example is always `a`. The Identifier will look for this variable first on `$context.$data`, then `$context`, then on the `globals` property of the `options` passed to the KSB constructor.

The *dereferences* is an array that identifies how to 'unwrap' the identifier. For example, for `a().b[4].d()` the dereferences will be an array like this: `['()', 'b', '4', 'd', '()']` where the `()` corresponds to a function call and the string names to the corresponding members on the result of the previous operation (which is first applied to the lookup value for `a`).

The parser may also produce an Expression. The Expression produces a tree that substantially reproduces the operations in the [order of precedence for Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence#Table).

## Expressions

Examples of expressions include:

{% highlight html %}
<div data-bind='binding1: a * b + c,
                binding2: a() * c[$index()] >= 3'></div>
{% endhighlight %}

The expression tree has at most two children and an operation. The node constructor looks like this:

{% highlight javascript %}
  function Node(lhs, op, rhs) {
    this.lhs = lhs; // left hand side
    this.op = op;   // a function
    this.rhs = rhs; // right hand side
  }
{% endhighlight %}

The parser generates an array of identifiers and operators (using `undefined` as filler for unary operators), and the Expression lazily builds a tree from this array that honours the expected operator precedence.

The algorithm is beyond the scope of this article. The gist though is that when building the tree it rebases the root node if the precedence of the operator being looked at is greater than the precedence of the root operator. The result is that building the tree requires only one pass through the array.

When the Expression value is looked up the tree is traversed with the operator function being called on the respective values of the left and right side nodes. It is simply:

{% highlight javascript %}
  Node.prototype.get_node_value = function () {
    return this.op(this.get_leaf_value(this.lhs),
                   this.get_leaf_value(this.rhs));
  };
{% endhighlight %}

A leaf can be any value, i.e. a primitive, a function, an object, an array, an Identifier, or an Expression.

As a bonus when an observable is part of an expression it is automatically unwrapped. I cannot think offhand of a use case where an unwrapped observable would be part of an expression. The performance cost for this is minimal, and it makes expressions slightly cleaner to look at.


# Conclusion

At NetPleadings we seriously use Knockout. On a given page we can sometimes have thousands of bindings, we have close to a hundred custom bindings, and we have at least 500 unique `data-bind` attributes throughout the project. We also take security seriously, so we want a robust Content Security Policy (CSP). So KSB had to work with the plethora of bindings we have, work while under a CSP restriction on `unsafe-eval`, and be reasonably performant.

With the implementation I have put up [at Github](https://github.com/brianmhunt/knockout-secure-binding/), KSB has been designed to work in spite of the `unsafe-eval` CSP restriction, it works with most of our expressions or they have been easily modified to work with KSB, and appears to be reasonably performant – at around 7 – 15% slower than Knockout according to [a jsperf example](http://jsperf.com/knockout-secure-binding) I put together. The loss of performance and restrictions on expressions seems a reasonable compromise for the additional protection offered by being able to use a Content Security Policy that prohibits unsafe evaluation of code.
