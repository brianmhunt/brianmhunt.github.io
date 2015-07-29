---
layout: post
title: "Details on the new Knockout Website"
date: "2015-07-29 11:11:11"
---

Here are some things that make the Knockout website neat.

1. Single-page app
2. Auto-reloading Application Cache
3. Sitemap generation
4. Javascript error checking
5. Inline auto-reloading samples
p
As you will see, at the core of our build process is [gulp](http://gulpjs.com), which has made a lot of hard things easy, and some impossible things just hard.

# Single-page app

The site uses Knockout along with a number of plugins. These include:

1. Knockout itself
2. jQuery
3. knockout-transformations
4. knockout.punches

## Overall page

We create a single instance of an object, [`Page`](https://github.com/brianmhunt/knockout/blob/gh-pages/src/Page.js) that [Knockout binds to the `<body>`](https://github.com/brianmhunt/knockout/blob/gh-pages/src/entry.js#L93-L98) and thereafter determines the state of the entire page. When an anchor is clicked it is [intercepted](https://github.com/brianmhunt/knockout/blob/gh-pages/src/events.js#L28) then, if the browser supports HTML5 history and the user has not disabled the single-page functionality, the page rewrite boils down to Knockout changing the `body` template of the `Page` instance.

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

We use the Ace editor to [show](https://github.com/brianmhunt/knockout/blob/gh-pages/src/bindings-highlight.js#L20) and [edit](https://github.com/brianmhunt/knockout/blob/gh-pages/src/bindings-edit.js#L37) examples. When a [change to the code occurs](https://github.com/brianmhunt/knockout/blob/gh-pages/src/bindings-edit.js#L21), the [`result`](https://github.com/brianmhunt/knockout/blob/gh-pages/src/bindings-result.js#L8) is updated.

Most of our examples are converted to Base64 to simplify escaping issues. When referenced they are converted to an [Example](https://github.com/brianmhunt/knockout/blob/gh-pages/src/Example.js#L4) instance in a [LiveExample](https://github.com/brianmhunt/knockout/blob/gh-pages/src/LiveExampleComponent.js#L14) component. The `LiveExample` is a separation of the user interface and communication from the `Example` itself; they could be combined but this lets us create `Examples` in other contexts from the `LiveExample`.
