---
layout: "post"
title: "ACME + AppEngine ... Simplified"
date: "2016-03-05 11:21"
---

Following my prior post on [Let's Encrypt - Acme on AppEngine](/articles/let-s-encrypt-acme-on-appengine/), I have rewritten
in Python and substantially simplified the process for deploying a challenge
with minimal user input.

In particular, the following script will extract the challenge from STDOUT of
Let's Encrypt, write the challenges to the given directory, call `appcfg.py`
to upload the challenges, before Let's Encrypt performs its validation.  If all
goes well, the private key is converted to a format usable by AppEngine and
both it and the certificate chain are printed to the terminal.

Accordingly, I have updated [my gist](https://gist.github.com/brianmhunt/7c647dce3e43d886f1d2), notably replacing all the Node/JS with
[a single Python script](https://gist.github.com/brianmhunt/7c647dce3e43d886f1d2#file-regen-py):

<script src="https://gist.github.com/brianmhunt/7c647dce3e43d886f1d2.js?file=regen.py"></script>

While it may still take some tinkering to get it right, the basic structure
works for my setup and the changes should mostly relate to configuration and
parameters.

There are some Python dependencies, notably Click, Colorama and pexpect.

This script remains quite convoluted, so I submitted [an issue to the Let's
Encrypt GitHub repository](https://github.com/letsencrypt/letsencrypt/issues/2610) to
enable arbitrary shell commands to perform steps for validation, which would dramatically simplify the process and make it more robust.
