---
categories:
- articles
comments: true
date: "2014-07-18T00:00:00Z"
description: |
  A few utilities to make contentEditable more tolerable.
image:
  credit: Michael Rose
  creditlink: https://mademistakes.com
  feature: so-simple-sample-image-4.jpg
modified: "2014-07-18 11:00:00"
share: true
tags:
- javascript
- contentEditable
- jQuery
title: Taming contentEditable with jQuery
---

# What is it?

This is a few examples of how one might extend jQuery to make
the
[contentEditable](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_Editable)
a more manageable component of the web.

For convenience I am just going to show the web-standards, so one will need
workarounds for IE < 9.

A more comprehensive suite (and from whose work I derive many of my
answers) is [rangy.js](https://github.com/timdown/rangy) by
[Tim Down](https://stackoverflow.com/users/96100).


# Why is it important?

The `contentEditable` flag is one of the few ways to get WYSIWYG styling on the
web. Many editors are based on it, such as
[bootstrap-wysiwyg](https://mindmup.github.io/bootstrap-wysiwyg/) among others.

However, `contentEditable` has numerous fundamental problems, as Nick Santos
highlights in
[Why ContentEditable is Terrible Or: How the Medium Editor Works](https://medium.com/medium-eng/why-contenteditable-is-terrible-122d8a40e480).

Arguably the [polymer-project](https://www.polymer-project.org/) will provide
us with an alternative, but we do not appear to be there yet.

So for the moment we are stuck with this beast. So here are some jQuery
functions that illustrate how it works and may make it more manageable.

There is nothing limiting these examples to jQuery, of course.

# What is a contentEditable?

One can turn a DOM element into a `contentEditable` one by setting the
[`contentEditable` attribute](https://html5doctor.com/the-contenteditable-attribute/).

So once you have the `contentEditable` attribute set, you can edit the
content.

This is fine if one is just entering text. The problem becomes if
you want to interact with it.


# The primary sources of interaction

The primary interface to the caret and selection of a `contentEditable`
is through `window.getSelection()`. This function returns a
[Selection](https://developer.mozilla.org/en-US/docs/Web/API/Selection).
From this selection instance we can get one or more
[Range](https://developer.mozilla.org/en/docs/Web/API/Range) instances
corresponding to a selection or caret, as shown below.


# Are we a caret?

First, here is how we determine if we are looking at a caret:

{{< highlight coffeescript >}}
$.fn.editableIsCaret = ->
  return sel.rangeCount == 1 and sel.getRangeAt(0).collapsed
  # alt test:
  # return window.getSelection().type == 'Caret'
{{< / highlight >}}

A range is `collapsed` if the start and end of the range are the same point.
This is a caret.

# Where is the caret?

The positioning of the caret is relative to an arbitrary number of nodes (we
are after all editing a `<div>`). So it is straightforward but not
obvious how to determine where said caret is.

{{< highlight coffeescript >}}
is_caret_at_start_of_node = (node, range) ->
  # See: https://stackoverflow.com/questions/7451468
  pre_range = document.createRange()
  pre_range.selectNodeContents(node)
  pre_range.setEnd(range.startContainer, range.startOffset)
  return pre_range.toString().trim().length == 0

is_caret_at_end_of_node = (node, range) ->
  post_range = document.createRange()
  post_range.selectNodeContents(node)
  post_range.setStart(range.endContainer, range.endOffset)
  return post_range.toString().trim().length == 0
{{< / highlight >}}


# Where is the caret?

Sometimes you want to get the `Range` that indicates where the caret is.
For example, you may want this to restore the location after losing focus.

{{< highlight coffeescript >}}
$.fn.editableRange = ->
  # Return the range for the selection
  sel = window.getSelection()
  return unless sel.rangeCount > 0
  return sel.getRangeAt(0)

$.fn.editableCaretRange = ->
  return unless @editableIsCaret()
  return @editableRange()
{{< / highlight >}}

Sometimes you want to know if the Caret is at the start or at the end
of the editable.

{{< highlight coffeescript >}}
$.fn.editableCaretAtStart = ->
  range = @editableRange()
  return false unless range
  return is_caret_at_start_of_node(@[0], range)

$.fn.editableCaretAtEnd = ->
  range = @editableRange()
  return false unless range
  return is_caret_at_end_of_node(@[0], range)
{{< / highlight >}}

Other times you may want to know if the caret is on the first or last line:

{{< highlight coffeescript >}}
LINE_HEIGHT = 20  # arbitrary, reasonable constant.

$.fn.editableCaretOnFirstLine = ->
  range = @editableRange()
  return false unless range
  # At the start of a node, the getClientRects() is [], so we have to
  # use the getBoundingClientRect (which seems to work).
  if is_caret_at_start_of_node(@[0], range)
    return true
  else if is_caret_at_end_of_node(@[0], range)
    ctop = @[0].getBoundingClientRect().bottom - LINE_HEIGHT
  else
    ctop = range.getClientRects()[0].top
  etop = @[0].getBoundingClientRect().top
  return ctop < etop + LINE_HEIGHT

$.fn.editableCaretOnLastLine = ->
  range = @editableRange()
  return false unless range
  if is_caret_at_end_of_node(@[0], range)
    return true
  else if is_caret_at_start_of_node(@[0], range)
    # We are on the first line.
    cbtm = @[0].getBoundingClientRect().top + LINE_HEIGHT
  else
    cbtm = range.getClientRects()[0].bottom
  ebtm = @[0].getBoundingClientRect().bottom
  return cbtm > ebtm - LINE_HEIGHT
{{< / highlight >}}


# Putting it all together

Here it is all fiddled together:

<iframe width="100%" height="400"
  src="https://jsfiddle.net/bmh_ca/abB6b/5/embedded/"
  allowfullscreen="allowfullscreen" frameborder="0"></iframe>

# Moving the Caret about

Getting information out is one problem. Putting information in is another and,
alas, beyond the scope of this article.

Nonetheless, here are a few examples.

We can move the caret to a given place by creating a range and
collapsing the selection to one end of the other — creating a caret.

{{< highlight coffeescript >}}
$.fn.editableFocus = (at_start=true) ->
  return unless @attr('contenteditable')
  sel = window.getSelection()
  sel.removeAllRanges() if sel.rangeCount > 0
  range = document.createRange()
  range.selectNodeContents(@[0])
  range.collapse(at_start)
  sel.addRange(range)
{{< / highlight >}}

More generally, if you have a range already:

{{< highlight coffeescript >}}
$.fn.editableSetRange = (range) ->
  sel = window.getSelection()
  sel.removeAllRanges() if sel.rangeCount > 0
  sel.addRange(range)
{{< / highlight >}}


# Conclusion

You can find most of the above on StackOverflow, so this is really a
coalescence. I hope you find it helpful.
