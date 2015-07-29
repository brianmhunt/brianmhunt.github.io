---
layout: post
title: "Details on the new Knockout Website"
date: "2015-07-29 11:11:11"
---

Here are some things that make the [new proposal](https://github.com/knockout/knockout/issues/1827) for a [new Knockout website](http://brianmhunt.github.io/knockout/) pretty darned cool, in our opinion.

1. Single-page app
2. Auto-reloading Application Cache
3. Javascript error checking
4. Inline auto-reloading samples

These are a selection of the many really cool features that underly the future online presence of Knockout. The ideas and implementation here will hopefully provide a really great user experience, help demonstrate a little of what Knockout can do, and show some techniques that can be used in many other contexts to improve the web.

# Single-page app

The site uses Knockout along with a number of other packages, as you can see in our [bower.json](https://github.com/brianmhunt/knockout/blob/gh-pages/bower.json#L20) and [package.json](https://github.com/brianmhunt/knockout/blob/gh-pages/package.json#L6).

The compiled [unminified source code](https://github.com/brianmhunt/knockout/blob/gh-pages/build/app.js) is pretty lean, coming in at under a thousand lines. While demonstratign the concept we are relying on [over a MB](https://github.com/brianmhunt/knockout/blob/gh-pages/build/libs.js) of Javascript libraries. Much of that can and will be minified down when it comes time to deploy more broadly.

Without further ado, let's get into the details.

## Overall page strategy

We create a single instance of an object, [`Page`](https://github.com/brianmhunt/knockout/blob/gh-pages/src/Page.js) that [Knockout binds to the `<body>`](https://github.com/brianmhunt/knockout/blob/gh-pages/src/entry.js#L93-L98) and thereafter determines the state of the entire page. When an anchor is clicked the event is [intercepted](https://github.com/brianmhunt/knockout/blob/gh-pages/src/events.js#L28) then, if the browser supports HTML5 history and the user has not disabled the single-page functionality, the page rewrite boils down to Knockout changing the `body` template of the `Page` instance. If the browser does not support HTML5 or the user turns off the single-page functionality, then the link is followed (though it may have been [rewritten](https://github.com/brianmhunt/knockout/blob/gh-pages/src/events.js#L12)).

When the body template changes the template shown changes. As well, `body` change [triggers](https://github.com/brianmhunt/knockout/blob/gh-pages/src/Page.js#L10) a page title update to the `data-title` attribute of the template being changed to.

To make things load quickly we [concatenate our templates](https://github.com/brianmhunt/knockout/blob/gh-pages/gulpfile.js#L101) into one file that is loaded asynchronously, likely from the appcache (more on that below).

All our pages are stored as markdown and also [compiled into a single file](https://github.com/brianmhunt/knockout/blob/gh-pages/gulpfile.js#L145). A couple tricks we've used include exposing the `gitVersion` as [a property of the `global` object](https://github.com/brianmhunt/knockout/blob/gh-pages/gulpfile.js#L29-L33), that is reloaded (minus debounce) every time it is accessed by e.g. the [markdown html template](https://github.com/brianmhunt/knockout/blob/gh-pages/config.yaml#L150). This becomes important when reporting to our Javascript error reporter, so we know what version has exhibited issues.

## History

I opted for HTML5 history support instead of [HTML5-History-API](https://github.com/devote/HTML5-History-API) or [history.js](https://github.com/browserstate/history.js/). Those are excellent plugins, but the aim here is to keep it simple and aim for the future.

As you can see from [the anchor click intercept and `popstate` handler](https://github.com/brianmhunt/knockout/blob/gh-pages/src/events.js#L28-L58) manipulating the history is pretty trivial when used in conjunction with Knockout.

## Multi-page fallback

All our links are rewritten to `/a/PAGE.html`. These links are simultaneously [generated individually](https://github.com/brianmhunt/knockout/tree/gh-pages/a) as actual files, and [generated for use by Knockout](https://github.com/brianmhunt/knockout/blob/gh-pages/build/markdown.html#L1) as templates that go into the `body` property of our `Page`.

# Auto-reloading Application Cache

The application cache speeds up loading time and gives offline access. We regenerate our application cache basically whenever [anything changes](https://github.com/brianmhunt/knockout/blob/gh-pages/gulpfile.js#L284) in the compiled files, [updating](https://github.com/brianmhunt/knockout/blob/gh-pages/gulpfile.js#L36) the [date of compilation](https://github.com/brianmhunt/knockout/blob/gh-pages/config.yaml#L12) so browsers will know to reload the cache.

When the page is loaded [regularly recheck](https://github.com/brianmhunt/knockout/blob/gh-pages/src/entry.js#L31-L56) the application cache. This is handy because we can inform users when there is a newer version. It also comes in handy as a livereload substitute during development.

# Error reporting

We are using [TrackJS](https://trackjs.com) to keep us up to date on what might be happening. So far, very few errors have been reported over a few hundred accesses, but it was easy to identify and fix the issues when they were reported. There's not much to say here other than we do it, and it's really awesome!

# Inline auto-reloading samples

Many of the examples on the website are “live” in the sense that they can be edited directly. They can also be sent off to jsFiddle and CodePen, making it easy to tinker, learn, and demonstrate reproducible issues.

We use the Ace editor to [show](https://github.com/brianmhunt/knockout/blob/gh-pages/src/bindings-highlight.js#L20) and [edit](https://github.com/brianmhunt/knockout/blob/gh-pages/src/bindings-edit.js#L37) examples. When a [change to the code occurs](https://github.com/brianmhunt/knockout/blob/gh-pages/src/bindings-edit.js#L21), the [`result`](https://github.com/brianmhunt/knockout/blob/gh-pages/src/bindings-result.js#L8) is updated.

Our inline examples are [decoded as YAML](https://github.com/brianmhunt/knockout/blob/gh-pages/gulpfile.js#L129), then [converted to JSON and encoded in Base64](https://github.com/brianmhunt/knockout/blob/gh-pages/gulpfile.js#L134) to simplify escaping issues.

When a `<live-example>` tag is bound by Knockout it is interpreted as a [LiveExampleComponent](https://github.com/brianmhunt/knockout/blob/gh-pages/src/LiveExampleComponent.js). The `base64` param is decoded and passed to an [Example](https://github.com/brianmhunt/knockout/blob/gh-pages/src/Example.js#L4) constructor in the [LiveExampleComponent](https://github.com/brianmhunt/knockout/blob/gh-pages/src/LiveExampleComponent.js#L14).

The `LiveExample` is a separation of the user and data interface from the instance of an `Example` itself; they could be combined but this lets us create `Examples` in other contexts from the `LiveExample`.

# Where to now?

Next up, we have to go through the examples, links, references, etc.. to clean it up. The style definitely needs some work. Some “live” time to give users time to give it a whirl and send feedback.
