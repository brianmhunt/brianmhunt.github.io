---
layout: post
title: Permanent HTTP caching and busting
description: >
  Code and ideas about permanent caches of changing resources.
modified: 2014-01-23 11:25:01
category: articles
tags:
  - ux
  - performance
  - caching
  - http
image:
  feature: so-simple-sample-image-1.jpg
  credit: Michael Rose
  creditlink: http://mademistakes.com
comments: true
share: true
---

# What is it?

Permanent caching is part of the HTTP protocol, a way to reduce server load and improve the user experience by speeding up load time.

# Why does it matter?

Caches make us and users happy. We get less load on our servers, and it's a significant speedup for load times.

The busting is important because without it the resource may not be downloaded by a browser even though it has been updated on the server.

# How does it work?

One can make a "bustable" cache a number of "static" resources that are loaded like this:

{% highlight html %}
<script async src='/all.js-{% raw %}{{ cache_buster }}{% endraw %}'></script>
{% endhighlight %}

By "static" I mean that **it changes at most when we deploy** our software. In addition to Javascript files this caching model can apply to our CSS and HTML template files, and any other static resources including images.

I discussed putting all our asynchronous loading via one file in the [previous post](/articles/making-everything-async/).

The `cache_buster` is a variable set to **the *mtime* of an arbitrary file,** and that *mtime* changes whenever we deploy our application to Google App Engine.

## Adding a long-term cache

The **HTTP header** we use to achieve a long-term cache is `cache-control`. We set its value to `max-age=31536000`. The `expires` header can also be used to
determine cachability, but the `cache-control` header overrides it.

In Flask we achieve the above for `all.js-*` with the following view:

{% highlight python %}
    @app.route("/all.js-<string:cache_id>")
    def all_js(cache_id):
        """Our javascript file"""
        return send_file("all.js",
                         mimetype="application/javascript",
                         add_etags=False,
                         cache_timeout=31536000,
                         conditional=False,)
{% endhighlight %}

For our Jinja2 templates we do something like the following:

{% highlight python %}
    @app.route("/templates-<string:cache_id>")
    def templates(cache_id):
        """Our reusable templates"""
        response = make_response(render_template("templates.html"))
        response.headers['Cache-Control'] = "max-age=31536000"
        return response
{% endhighlight %}

Any resource with this cache header may be **permanently cached** for up to a year (i.e. *max-age*) by the browser. I say *may* because caching is optional and in any case the browser will eventually remove old cache items.

## Avoiding conditional tags e.g. *etag*

If you add a [header](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html) like `etag` or the conditional headers `if-(un)modified-since`, `if-range` and `if(-none)-match` then the browser *may* make a request [even if the item is cached](http://stackoverflow.com/questions/499966). Since we define the resource by its `mtime` a conditional cache header would be redundant.

While it does not make sense for our model, if one wanted to **implement etags** in Flask, there is [a helpful snippet](http://flask.pocoo.org/snippets/95/).

## Avoiding app.yaml

Google App Engine adds an `etag` header. We could otherwise serve files with `app.yaml` like this:

{% highlight yaml %}
- url: /all.js.*       # Matches all.js-{% raw %}{{ cache_buster }}{% endraw %}
  expiration: 360d     # Specifies how long to cache the request
  static_files: scripts/all.js
  upload: scripts/all.js
{% endhighlight %}

Alas the `etag` header causes requests to be made to the server. Checking the etag takes about **70–100ms** of extra time per resource over App Engine. If a resource is in cache it takes around **3–15ms** to obtain it. It is small yet a magnitude of improvement.

It is possible that one could **customize** the `headers` setting of the static files served via `app.yaml` but I did not bother to check if one could remove the `etag` this way. In any case the `etag` header being added seems **undocumented** so I would not rely on any hack around it since the **behaviour might change** without notice.

## HTML5 offline web application

I experimented with putting the templates and Javascript into an [HTML5 offline web application](http://diveintohtml5.info/offline.html) but the benefits proved marginal compared to the above while the complexity went up significantly. Nevertheless, it is an interesting option worth bearing in mind.

# Drawbacks

A browser might keep lots of resources around that are outdated. For example
`all.js-1385473710.0`, `all.js-1385472151.0`, etc. This **wastes space**.

Also any **risk of incontinuity** between the request and the resource might
lead to the browser using the old version. For example, if the server starts
serving our web-page that references `all.js-X`, yet our `all.js-*` view is
still serving previous version i.e. it has not yet been updated, then the
browser might interpret `all.js-X` to be the old version forevermore. Once it is cached, it is there forever. This is not a risk we are concerned about with Google App Engine, since **deployments are atomic**. If deploying is not atomic, for example if you are using a content delivery network where there is lag between deployment and the commencement of delivery, this would be a concern.

# Results

With the aggressive caching our page loads are reduced to around 15KB of data transferred for the average page, plus any JSON from the server for the data. The improvement in load time has been a substantial decrease of download time from around **3 seconds per page** of aggregate network transfer time to about **400ms** after the main page completes.

We combined this with the **asynchronous Javascript loading** discussed [in the previous post](/articles/making-everything-async/).
