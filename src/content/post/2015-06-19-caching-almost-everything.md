---
date: "2015-06-19T00:00:00Z"
title: Caching almost everything static on Google App Engine
---

# What is it?

An aggressive caching technique.

# Why is it important?

Caching can save time & resources downloading.

# How do we do it?

A simple HTML file and a simple tiny loader script (~900 bytes).

Here is the `HTML`:

```html
<!doctype html>
<html>
  <head>
    <script src='/loader.js'></script>
    ...
  <head>
  <body> ... </body>
</html>
```

and annotated `loader.js`:

```javascript
(function () {
  "use strict";
  // We build this file on deploy and replace $TIME with the build time.
  window._build = $TIME;
  // Add the CSS styles.
  var styles = document.createElement('link');
  styles.href = '/styles.css-' + window._build;
  styles.rel = 'stylesheet'
  document.head.appendChild(styles);
  // Add our Javascript libraries
  var libs = document.createElement('script');
  libs.src = '/libs.js-' + window._build;
  document.head.appendChild(libs);
  // When the libraries have loaded, we load our application.
  // Note IE8 workaround at https://stackoverflow.com/a/15437678/19212
  libs.onload = function () {
    var app = document.createElement('script');
    app.src = "/app.js-" + window._build;
    document.head.appendChild(app);
  }
})();
```

The scripts are loaded asynchronously, so one may wish to check that
the document is loaded before doing anything in `app.js`. We compile our
libraries (`lodash`, `knockout`, etc.) into a `libs.js`, which
speeds up our recompilation time for our `app.js`.

You will note that we are changing the names of the files. For example,
we are getting `/libs.js-$TIME` for some value of `$TIME`. Ordinarily
one could just use `?_cache_buster=$TIME` to get a new version, but we are
not just caching the version on the client. We are pushing a version of the
file out to the Google static file cache. We use unique filenames to ensure
that the latest version is being served.

With this setup we can set really-long expirations; for `app.yaml` in Google
App Engine:

```yaml
application: APP ID
version: release-version
runtime: python27
api_version: 1
threadsafe: true

default_expiration: "365d"

handlers:
# Short expirations for index.html and loader.js
- url: /
  expiration: 1s
  static_files: static/index.html
  upload: static/index.html

- url: /loader.js
  expiration: 1s
  static_files: static/loader.js
  upload: static/loader.js
  mime_type: application/javascript; charset=UTF-8

# Long expirations for our other content
- url: /(.*).js.map(?:-\d+)?
  static_files: static/\1.js.map
  upload: static/(.*).js.map
  mime_type: application/json

- static_files: static/\1
  upload: static/(.*)
  application_readable: true
  # ">-" starts a multiline string that trims whitespace.
  url: >-
    /(?:fonts/)?(.*.(?:html|js|css|woff2|svg|ttf|png|jpg|json))(?:-\d+)?$
```

Google does a good job of serving up static files with a long-term cache.

# Conclusion

This is a "poor man's" alternative to (and in some respects a potential
compliment of) the
[Application Cache](https://www.html5rocks.com/en/tutorials/appcache/beginner/),
which is more involved and comes with a number of
[gotchas](https://www.html5rocks.com/en/tutorials/appcache/beginner/).

I hope this gives some insight into a possible caching strategy
that will work for you.
