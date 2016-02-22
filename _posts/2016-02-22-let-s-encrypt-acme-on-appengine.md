---
layout: "post"
title: "Let's Encrypt - ACME on AppEngine"
date: "2016-02-22 14:09"
---

# What is this?

This is a bit of process that I use to get TLS keys to use on AppEngine
using Let's Encrypt.

# Why's it matter?

There are a number of quirks in Let's Encrypt and TLS on AppEngine that
make it more difficult to automate the process.  This helps ease the problem,
as best we can at the moment.


# Let's get started!

First of all, the limitations.  In the usual course one would run Let's Encrypt
on the web-server where the certificate will be used.  This is not (yet)
an option for AppEngine.

The relevant Google Code issue for AppEngine is [#12535](https://code.google.com/p/googleappengine/issues/detail?id=12535).

In the mean time, we can use the `--manual` process for validating a server.

## The `--manual` Validation process

Running `letsencrypt certonly --manual ...` produces a response to a challenge
that Let's Encrypt will perform of the web-server to verify that we, the
ones requesting a signed TLS certificate, indeed own the server.

The `letsencrypt` command above will print something like:

> Make sure your web server displays the following content at
http://www.example.com/.well-known/acme-challenge/KmgmF6qZl6XCHmQMRyb4Uge-lP1-jvFF-C4LhKfxmXk before continuing:
>
> KmqMF6qZl6XCHmQMRyb4Uge-rP1-jvFF-C4LhKfxmXk.7YEye9w3fzcAYQGTbPSwhDyqBumUaUCNDouAgx4Diu0
>
> ...
>
> Press ENTER to continue

So the challenge we have to meet to get our signed certificate is to serve the
above file and content on our Google App Engine.

## Serving the Challenge-Response

To separate out the ACME part of our service from the rest, one can use
[App Engine's modules](https://cloud.google.com/appengine/docs/python/modules/).

By using modules we speed up the deploy process, circumvent any continuous
integration, and minimize any exposure across the system.

To set up a module, one needs a `dispatch.yaml`, something like this:

<script src="https://gist.github.com/brianmhunt/7c647dce3e43d886f1d2.js?file=dispatch.yaml"></script>

Then one needs a `module.yaml`, something like this:

<script src="https://gist.github.com/brianmhunt/7c647dce3e43d886f1d2.js?file=module.yaml"></script>

The directory setup looks like this:

    dispatch.yaml
    acme/
    acme/module.yaml
    acme/challenges/


To set up the module and dispatch one must run, once,

> $ `appcfg.py update module.yaml -A appengine-example-project`
>
> $ `appcfg.py update_dispatch dispatch.yaml -A appengine-example-project`


## Getting a new key

So to mostly-automate the process I have created a couple `gulp` tasks, as
seen here:

<script src="https://gist.github.com/brianmhunt/7c647dce3e43d886f1d2.js?file=acme.js"></script>

After making the appropriate changes to the config (which in this task is
exposed as a global), one can obtain a signed key by following these steps:

1. Run `gulp acme:gen -t stage`.
2. Wait for the challenge (i.e. the "`Press Enter to continue`"
3. Run (in another shell) `gulp acme:cr -t stage`
4. Enter the file-name and challenge and wait for deployment
5. Press `Enter` in the `gen` terminal; the certificate and private key ought to be printed to the terminal
7. Copy the certificate and private key into the corresponding fields of a new key in [App Engine's Cloud Console](https://console.cloud.google.com/appengine/settings/certificates).


## Summary

I hope the above helps shed some light on what might be a somewhat
daunting process.

Obviously it'll be better when AppEngine and Let's Encrypt
talk directly. That requires some engineering on Google's side, and while
the issue \#12535 has been accepted, there's no indication of a timeline.

In the interim, the above is a not–too–onerous process for the 90 days renewal
that ACME requires.
