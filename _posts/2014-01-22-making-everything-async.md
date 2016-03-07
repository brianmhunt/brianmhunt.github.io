---
layout: post
title: Asynchronous client-side Javascript page loading
description: >
  Code and ideas about the client-side script-loading experience.
modified: 2014-01-22 11:25:01
category: articles
tags:
  - performance
  - ux
  - javascript
  - html
image:
  feature: so-simple-sample-image-1.jpg
  credit: Michael Rose
  creditlink: https://mademistakes.com
comments: true
share: true
---

# What is it?

A process for loading our script resources asynchronously, with one `<script>` tag, like this:

```html
<script async src='/all.js-{% raw %}{{ cache_buster }}{% endraw %}'></script>
```

This all.js file loads all our Javascript, external services, templates, and any RESTful resources from our server.

We discuss the `cache_buster` in [the next post](/articles/permanent-caching-and-busting).

# Why is it important?

Having one file for Javascript gives us:

1. one file to request;
2. improved cachability;
3. parallel requests for our resources;
3. centralizing where we control our loading;
4. fine-grained control of the loading process.

We have a fairly hefty application. Every page loads about 2MB of Javascript, and around 200KB of HTML templates. We also load a number of third party services, such as Uservoice, Typekit and Stripe.

# How does it work?

We compile all our Javascript using [grunt](https://gruntjs.com) and [Browserify](https://browserify.org/).

The compiled Javascript loads the external services Uservoice, Typekit and Stripe, as well as our templates, as set out below.

## Third party services

Loading the third party services is usually done with `<script>` tags in the `<head>` tag or inline Javascript. We avoid inline javascript because it violates the Content Security Policy, and it's less organized.

We avoid the script tags for external services because:

1. if they are synchronously loaded they slow down the page loading;
2. if asynchronously loaded (with the `async` or `defer` attribute) we cannot tell when they have completed loading without polling; or
3. they have mucked up the page completely and we want better control over their inclusion.

### Typekit

Here is the Coffeescript I use to load Typekit. The real trick here is in catching the exceptions and timeouts so that the user can still get stuff done, ugly though the fonts may be.

```coffeescript
load_typekit = (timeout=3000) ->
  LOADING_CLASS = 'wf-loading'
  FAIL_CLASS = "wf-inactive"
  kitId = 'OUR-TYPEKIT-ID'
  url = "//use.typekit.net/#{kitId}.js"

  $.ajax(url, timeout: 1500, dataType: "script")
    .done(->
      try
        Typekit.load(kitId: kitId, scriptTimeout: timeout)
      catch b
        $("html").removeClass(LOADING_CLASS).addClass(FAIL_CLASS)
      return
    )
    .fail((jqxhr, settings, exception) ->
      console.error("Problem getting TypeKit at #{url}", jqxhr,
        settings, exception)
      $("html").removeClass(LOADING_CLASS).addClass(FAIL_CLASS)
      return
    )
  return
```

We have a much lower threshold for the timeout on Typekit than the other services below because if it is slow or fails to load then the application is rendered unusable because the page never hides the loading screen to show the page.

We use the following CSS to get around the [Flash of Unstyled Text](https://help.typekit.com/customer/portal/articles/6852-controlling-the-flash-of-unstyled-text-or-fout-using-font-events):

```css
/* html */.wf-loading {
  opacity: 0;
  visibility: hidden;
}

/* html */.wf-active {
  visibility: visible;
  opacity: 1;
  -webkit-transition: opacity 0.55s ease-in-out;
     -moz-transition: opacity 0.55s ease-in-out;
       -o-transition: opacity 0.55s ease-in-out;
          transition: opacity 0.55s ease-in-out;
}
```

This is essentially what Typekit has suggested, but with a pleasant opacity transition.

A neat observation of using the CSS FOUT is that the browser seems noticibly faster when loading the asynchronous resources. Without more analysis I can only speculate why, but I imagine because the processor is not rendering for the first 400ms of a page load it can concentrate on network tasks. Whatever the reason, we were very pleased with this unexpected benefit.

Typekit has been and remains the largest barrier to quickly displaying something on screen, since it must be loaded before the page displays any fonts. Nevertheless this is more than made up for in the improvement in our typographic options and the unexpected benefit the FOUT CSS makes to load times.

Before Typekit is loaded one could get an image out to the user with an animated background image, as described in [Avoid FOUT by Adding a Web Font Preloader](https://webdesign.tutsplus.com/tutorials/ux-tutorials/quick-tip-avoid-fout-by-adding-a-web-font-preloader/) like this:

```css
.wf-loading {
  /* ... */
  background: url('../images/ajax-loader.gif') no-repeat center center;
  height: 100%;
  overflow: hidden;
}
```

If I were to do this I would prefer the page not display some arbitrary loading image, but an image that resembles what the rendered page will eventually look like. I feel the users would find that a more comfortable transition since I find blanking the page gives the impression of impermanence and a feeling of incontinuity and fragility to the service.

### Uservoice

Uservoice is straightforward. Note that we are doing our best to become [Content-Security-Policy (CSP)](https://www.w3.org/TR/CSP/) compliant, so page-specific attributes such as the current-user email and key are added as attributes to the `<body>` tag.

```coffeescript
load_uservoice = ->
  url = '//widget.uservoice.com/OUR-WIDGET-URL.js'

  # Add a global list for adding UserVoice settings
  UserVoice = window.UserVoice or []

  # We have to set the global option so that UserVoice knows what the
  # settings are.
  window.UserVoice = UserVoice

  # Load the UserVoice script
  $.getScript(url)

  # Colors
  UserVoice.push ['set',
    accent_color: '#448dd6',
    trigger_color: 'white',
    trigger_background_color: 'rgba(46, 49, 51, 0.6)'
  ]

  # User identity & traits
  UserVoice.push ['identify',
    email: $('body').attr("data-user-email"),
    id: $("body").attr("data-current-user-key"),
  ]

  # Add default trigger to the bottom-right corner of the window:
  UserVoice.push ['addTrigger',
    mode: 'contact',
    trigger_position: 'bottom-right'
  ]

  UserVoice.push ['autoprompt', {}]
```


### Stripe

Like Uservoice, Stripe via [Stripe.js](https://stripe.com/docs/stripe.js) is straightforward. Again we have added our stripe key to the `<body>` tag so that we remain CSP-compliant.

```coffeescript
initialize_stripe = ->
  url = "https://js.stripe.com/v1/"
  pub_key = $("body").attr("data-stripe-pubkey")
  $.getScript(url)
    .done(-> window.Stripe.setPublishableKey(pub_key))
    .fail((jqxhr, settings, exception) ->
      console.error("Problem getting Stripe at #{url}", jqxhr, settings, exception)
    )
```


### Templates

We use a lot of templates on the page, in the form of Bootstrap modals and Knockout templates. Rather than putting these reusable templates into every page we follow the same caching mechanism as for `all.js`.

```coffeescript
initialize_page = ->
  cache_buster = $("body").attr("data-cache-buster")
  $.ajax("/templates.html-#{cache_buster}").done((html) ->
    $("body").append(html)
    page_init()              # Or whatever function starts your journey.
  )
```

## The superfluous async attribute

While we are using the HTML5 `async` script attribute on our `all.js` tag, it is worth noting that this probably has no effect. Since we are using *FOUT* CSS workaround below, the page is blank until the Typekit javascript finishes loading. We make the assumption that some page rendering that could not otherwise happen in parallel occurs when `async` is used, but that said we have not noticed any significant difference one way or the other.

That said, because it is `async` the `<script>` tag can go in the `<head>` tag instead of at the end of the page, without slowing down the page loading.

## And in the darkness ...

I put all the above together like this:

```coffeescript
$(->
  load_typekit()
  initialize_stripe()
  initialize_page()
  _.defer load_uservoice
)
```

Note that we have deferred the loading of Uservoice. This was to work around a
problem where Uservoice would push out code that broke jQuery.

## Results

When our page was loading synchronously we were sometimes seeing ten seconds  before the page displayed anything at all. With everything being asynchronous we have a page typically displaying something within 700ms and everything loaded under 3 seconds.

This combined with the caching discussed in [the next post](/articles/permanent-caching-and-busting) has allowed us to achieve a load time that we are comfortable with in terms of the user experience we aspire to.

I hope you have enjoyed reading. Please feel free to comment.
