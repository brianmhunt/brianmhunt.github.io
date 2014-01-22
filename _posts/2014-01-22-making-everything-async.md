---
layout: post
title: Asynchronous client-side Javascript page loading
description: "Code and ideas about the page-loading experience."
modified: 2014-01-22 11:25:01
category: articles
tags: [performance ux]
image:
  feature: so-simple-sample-image-1.jpg
  credit: Michael Rose
  creditlink: http://mademistakes.com
comments: true
share: true
---

# Introduction

Here are some things we have done that we believe positively affect the loading experience of our application. This has brought us closer to the experience we had hoped for and I thought you might find it interesting.

We have a fairly hefty application. Every page loads about 2MB of Javascript, and around 200KB of HTML. We also load a number of third party services, such as Uservoice, Typekit and Stripe.

The key to improving the user experience has been an aggressive caching scheme and parallelizing the loading of the Javascript, as we detail below.

I would certainly be interested in others' experiences with and thoughts on the techniques below.

## One javascript file to rule them all

All our javascript is included or compiled from Coffeescript via [Browserify](http://browserify.org/). At the end of our main html file we have:

{% highlight html %}
<script async src='/all.js-{% raw %}{{ cache_buster }}{% endraw %}'></script>
{% endhighlight %}

We are using Jinja2 to compile the html files. The `cache_buster` a variable set to the *mtime* of a file, and that *mtime* changes whenever we deploy to Google App Engine.

Our `cache_buster` also changes locally whenever Browserify recompiles our scripts into `all.js`, so development can use caching.

Our Google App Engine `app.yaml` contains:

{% highlight yaml %}
- url: /all.js.*       # Matches all.js-{% raw %}{{ cache_buster }}{% endraw %}
  expiration: 360d     # Specifies how long to cache the request
  static_files: scripts/all.js
  upload: scripts/all.js
{% endhighlight %}

Our `all.js-*` resource effectly never expires. This has the advantage that the server is not polled for `Etags` or `Last-Modified` headers. The disadvantage is that the browser may keep stale versions of `all.js-*` locally, wasting space.

While we are using the HTML5 `async` script attribute, it is worth noting that this probably has no effect. Since we are using *FOUT* CSS workaround below, the page is blank until the Typekit javascript finishes loading. We make the assumption that some page rendering that could not otherwise happen in parallel occurs when `async` is used, but that said we have not noticed any significant difference one way or the other.


## Third party services

We load all our third party services from our main javascript file, as follows.

### Typekit

{% highlight coffeescript %}
load_typekit = (timeout=3000) ->
  LOADING_CLASS = 'wf-loading'
  FAIL_CLASS = "wf-inactive"
  kitId = 'TYPEKIT-ID'
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
{% endhighlight %}

We have a much lower threshold for the timeout on Typekit because if
it is slow or fails to load then the application is rendered unusable
because the page never hides the loading screen to show the page.

We use the following CSS to get around the [Flash of Unstyled Text](http://help.typekit.com/customer/portal/articles/6852-controlling-the-flash-of-unstyled-text-or-fout-using-font-events):

{% highlight css %}
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
{% endhighlight %}

This is essentially what Typekit suggested, but the transition is nicer.

One of the neat observations of using the CSS FOUT is that the browser seems noticibly faster when loading the asynchronous resources. Without more analysis I can only speculate why, but I imagine because the processor is not rendering for the first 400ms of a page load it can concentrate on network tasks. Whatever the reason, we were very pleased with this unexpected benefit.

### Uservoice

Uservoice is straightforward. Note that we are doing our best to become [Content-Security-Policy (CSP)](http://www.w3.org/TR/CSP/) compliant, so page-specific attributes such as the current-user email and key are added as attributes to the `<body>` tag.

{% highlight coffeescript %}
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
{% endhighlight %}


### Stripe

Like Uservoice, Stripe is straightforward. Again we have added our stripe key to the `<body>` tag so that we are CSP-compliant.

{% highlight coffeescript %}
initialize_stripe = ->
  url = "https://js.stripe.com/v1/"
  pub_key = $("body").attr("data-stripe-pubkey")
  $.getScript(url)
    .done(-> window.Stripe.setPublishableKey(pub_key))
    .fail((jqxhr, settings, exception) ->
      console.error("Problem getting Stripe at #{url}", jqxhr, settings, exception)
    )
{% endhighlight %}


### Templates

We use a lot of templates on the page. Rather than putting these reusable templates into every page we follow the same caching mechanism as for `all.js`.

{% highlight coffeescript %}
initialize_page = ->
  cache_buster = $("body").attr("data-cache-buster")
  $.ajax("/templates.html-#{cache_buster}").done((html) ->
    $("body").append(html)
    page_init()   # And so the journey begins.
  )
{% endhighlight %}

The `cache_buster` here is the same as the variable in Jinja2.

## And in the darkness ...

I put all the above together like this:

{% highlight coffeescript %}
$(->
  load_typekit()
  initialize_stripe()
  initialize_page()
  _.defer load_uservoice
)
{% endhighlight %}

Note that we have deferred the loading of Uservoice. This was to work around a
problem where Uservoice would push out code that broke jQuery.

## HTML5 offline web application

I experimented with putting the templates and Javascript into an [HTML5 offline web application](http://diveintohtml5.info/offline.html) but the benefits proved marginal compared to the above while the complexity went up significantly. Nevertheless, it is an interesting option worth bearing in mind.

## Results

When our page was loading synchronously we were sometimes seeing ten seconds  before the page displayed anything at all. With everything being asynchronous we have a page typically displaying something within 700ms and everything loaded under 3 seconds.

With the aggressive caching our page loads are reduced to around 25KB for the average page plus any JSON from the server for the page.

Typekit was and remains the largest barrier to quickly displaying something on screen, since it must be loaded before the page displays anything. Nevertheless this is more than made up for in the improvement in typography and the unexpected benefit the FOUT CSS makes to load times.

I hope you have enjoyed reading. Please feel free to comment.
