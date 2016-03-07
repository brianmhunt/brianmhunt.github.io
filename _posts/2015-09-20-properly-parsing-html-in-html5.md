---
layout: post
title: "Properly Parsing HTML in HTML5"
date: "2015-09-20 11:58"
---


Parsing HTML in Javascript is harder than one would expect.  You would think
that the browser, a HTML parser by its very nature, would give access to easy
HTML parsing.  But you'd be wrong, and here is an example of why:

```javascript
> d = document.createElement('div')
<div>​</div>​

> d.innerHTML = '<tr></tr>'
"<tr></tr>"

> d.innerHTML
""
// ^^ Uh oh.  Where'd it go?
```

The problem is that the `<tr>` tag in HTML requires a parent of `<table>` or
`<tbody>` or `<thead>` or `<tfoot>`, according to the
[W3C HTML5 spec](https://www.w3.org/html/wg/drafts/html/master/semantics.html#the-tr-element).

What this means is that in HTML a `<tr>` is never a child of a `<div>`
tag, and the browser automatically fixes this for you.

The jQuery and Knockout parsers get around this by wrapping the HTML in the
parent nodes that are required.  There are a few HTML elements that need
parents of a specific sort: `area`, `thead`, `tbody`, `tr`, `td`, and
 [others](https://github.com/brianmhunt/knockout/blob/1880--template-html-parser/src/utils.domManipulation.js#L11-L26).

Two popular parsing implementations, jQuery and Knockout, have problems.

The `$.parseHTML` method of
jQuery v1.11.3 and v2.1.4 incorrectly parse custom elements that start with one
of the nodes that requires wrapping, such as `<tr-something>` or
`<area-custom-element>`.

The Knockout 3.3.0
parser has trouble with comments that precede an element such as
`<!-- ... --><b>...`.  (Though we are [working to fix this](https://github.com/knockout/knockout/pull/1881)!)

These problems with `knockout` and `jQuery` are edge cases, but they can be
difficult to debug and onerous to work around.

An elegant – and arguably the “correct” – answer becomes available when a
browser supports the `<template>` tag. Let's have a look at the example above,
but using a template tag:


```javascript
> t = document.createElement('template')
<template>​…​</template>​

> t.innerHTML = '<tr></tr>'
"<tr></tr>"

> t.innerHTML
"<tr></tr>"
// ^^ Happy dance?
```

This works because [the template tag spec](https://www.w3.org/html/wg/drafts/html/master/semantics.html#the-template-element)
permits its content to be nodes of any of the elements that require us working
around.

You can get the parsed nodes by iterating over `t.childNodes`
(if you want HTML comments and text nodes) or `t.children` (if you do not).
You can also inject the parsed content into the document as follows, but bear in
mind that the parental rule requirements apply after insertion.

```javascript
var clone = document.importNode(t.content, true);
document.body.appendChild(clone);
```

The result is that you have access to the browser's native HTML parsing,
without those relatively complex (and possibly
  [slow](https://github.com/knockout/knockout/issues/1880#issuecomment-141083904))
workarounds that aspire to but do not quite reach parity with builtin browser parser.

Most browsers in their most recent incarnations
[support the template tag](https://caniuse.com/#feat=template), including
Internet Explorer Edge 13.
Until the latest browsers are more widespread we will have to live with some
compromises, but the future of HTML parsing with Javascript in browsers looks
bright.
