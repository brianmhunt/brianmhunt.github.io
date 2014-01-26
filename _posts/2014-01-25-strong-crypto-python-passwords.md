---
layout: post
title: Storing passwords using Python
description: >
  Using strong cryptography to store passwords with Python
modified: 2014-01-22 11:25:01
category: articles
tags:
  - security
  - crypto
  - python
image:
  feature: so-simple-sample-image-1.jpg
  credit: Michael Rose
  creditlink: http://mademistakes.com
comments: true
share: true
---

# What

Storing passwords with cryptographically recognized techniques, using Python.


# Why

Stored passwords get disclosed from time to time.

This is bad news for users, the authenticator, and it undermines trust in our systems for storing and accessing online data.

When using cryptography it is possible that even if the values stored are
disclosed that the secrets they reflect remain opaque, or at least cost ineffective to discover.


# How

Using the cypher [Password-Based Key Derivation Function 2](http://en.wikipedia.org/wiki/PBKDF2) or (perhaps even better) [scrypt](http://en.wikipedia.org/wiki/Scrypt) or bcrypt one can make it expensive to obtain secrets from stored values. These cyphers are known as [key derivation functions (KDF)](http://en.wikipedia.org/wiki/Key_derivation_function) and below is an example of using a KDF in Python on Google App Engine.

A KDF is given a token (e.g. a password) and returns what is called a *derived key*, which is the value that one stores.

With PBKDF2 it can be computationally expensive to verify that a token is equal to a derived key. The expense is proportional to the number of *iterations* given as a parameter. With scrypt the number of iterations increases not only the computational intensity but the amount of memory needed.

There is an excellent Q & A [Security.SE: How to securely hash passwords?](http://security.stackexchange.com/q/211/2914) that goes into detail how to do this. What is below is just an implementation that I hope adheres to the principles set out there.

The entire class below can be found in a [Github Gist](https://gist.github.com/brianmhunt/8621775).

## The vector

The topic merits a little background. If someone slurps a database of passwords, there are a number of ways they can obtain the secret passwords from the stored values. If the passwords are stored in plain text then the gig is up. If the passwords are hashed, then there is more work that must be done.

One would typically start by comparing the values against a database of popular passwords, which may indicate the algorithm used to hash the values. For example the following, with outcomes shortened for brievity:

| Password | Hash | Outcome |
|:---------|:-----|--------:|
| "password" | MD5  | `5f4dcc3b5aa765d61d8...`  |
| "12345" | MD5 |     `827ccb0eea8a706c4c3...` |
| "password" | SHA1 | `5baa61e4c9b93f3f068...` |
| "12345" | SHA1 |    `8cb2237d0679ca88db6...` |

These indicators of underlying mechanisms and values are called *oracles*. Once one has an oracle that indicates the algorithm, one can use a [dictionary attack](http://en.wikipedia.org/wiki/Dictionary_attack) to check for the presence of common passwords. These dictionary attacks are often very computationally cost effective, when employed with [rainbow tables](http://en.wikipedia.org/wiki/Rainbow_table).

That said, oracles of this sort are like slugs: you can kill them with [salts](http://en.wikipedia.org/wiki/Salt_(cryptography)). That is not the end of the story though, since modern GPUs can calculate hashes such as SHA1 at a rate of around 2.3 billion per second.

The KDF requires a salt, but it also makes the oracle much more expensive. The KDF increass the comparisons necessary – one for every potential value of the iterations – and one can vary the number of iterations, so even where one matches a password to a secret that match generally reveals the secret in that one instance. With a regular hash or where the KDF iterations are constant the match will reveal the number of iterations.

Here is a KDF at work, with just an 8 byte key for illustration, and a salt of "" (two double-quote characters):

| Password |  Iterations | Outcome |
|:---------|:-----------:|--------:|
|"password"| 1 | `3eefce369f0ef5fa` |
|"password"| 2 | `12a3e0e9cd5360ba` |
|"password"| 10000 | `5132aa11fb99782d` |

The outcome is always the same length, but varies on the iterations. It similarly varies on the salt. Here is one iteration with different salts:

| Password |  Salt | Outcome |
|:---------|:-----------:|--------:|
|"password"| X | `0dd67697c0626ce7` |
|"password"| Y | `39adb360cdc543df` |
|"password"| Z | `63bea2aa5e5468f1` |

You can [try PBKDF2 online](http://anandam.name/pbkdf2/). Note how the number of iterations significantly increases the time to produce the result. Changing the salt will alter the outcome, but not the computation time.

Thus, even if one obtains the stored secrets it is computationally expensive to obtain the passwords that were used to authenticate individuals these secrets represent.


## Our implementation

Here is what we include in Python:

{% highlight python %}
import Crypto.Random
from Crypto.Protocol import KDF
from google.appengine.ext import ndb
from datetime import datetime
{% endhighlight %}

As an aside, developing with `Crypto` onto App Engine used to be [something of a challenging](http://stackoverflow.com/questions/11788508). This issue has, with great thanks to the App Engine developers, been resolved. The challenge of
getting Crypto onto App Engine is why we settled on PBKDF2 instead of bcrypt or scrypt. It may be easy to get the below working for those KDFs as well, now.

I am going to use a class in [App Engine's NDB](https://developers.google.com/appengine/docs/python/ndb/) to store the credentials. One can reference theses credentials by a key, or making them an internal property of another NDB model, and changing them to work in another data store context should be straightforward.


## class Credentials – definition

Here is the opening of the class definition with the constants and stored values for each credential. Every user would have a corresponding instance of the `Credentials` class in the datastore that would be used to authenticate their identity.

{% highlight python %}
class Credentials(ndb.Model):
    """Credentials to authenticate a person.
    """
    # --- Class Variables ---
    # Our pseudo-random stream - used for generating random bits for the
    # salt and for iterations entropy
    _randf = None

    # --- Constants ---
    # Keep track of the basic number of iterations for our derived key,
    # which is stored with the key.
    ITERATIONS_2013 = 60000

    # Arbitrary, constant offset, not stored with the key but in the code.
    ITER_OFFSET = -257

    # Length of the stored key.
    DK_LEN = 32

    # --- Datastore variables ---
    # A derived key from e.g. PBKDF2 (or, future: scrypt)
    dk = ndb.BlobProperty(indexed=False)

    # The salt; randomly generated for each dk.
    salt = ndb.BlobProperty(indexed=False)

    # The number of KDF iterations, starting from ITERATIONS_2013 plus or
    # minus a small random amount, and increasing in amount over time to
    # compensate for increasing computational power.
    iterations = ndb.IntegerProperty(indexed=False)

    # --- OTHER ---
    # The next couple items are not part of this article, but included
    # as food for thought.

    # We keep track of how many times a person has attempted to log in.
    failed_attempts = ndb.IntegerProperty(indexed=False)

    # Computers authorized is a map from a uuid to an object with a date
    # and list of IP addresses.
    computers_authorized = ndb.JsonProperty()

    # Two factor authentication.
    other_factor = ndb.StringProperty(indexed=False)
{% endhighlight %}

I am not going to get into the `computers_authorized`, `failed_attempts`, or `other_factor` here, other than to note that are also worth bearing in mind in any authentication scheme.


## String casting leakage

We do not want our logs or any other conversion of the credentials to leak the contents of the model, so we overload the following to prevent that from happening. This is just a good practice for this sort of thing.

{% highlight python %}
    def __str__(self):
        return unicode(self).encode('utf-8')

    def __unicode__(self):
        return "<Credentials: {}>".format(dict(
            failed_attempts=self.failed_attempts
        ))
{% endhighlight %}


## Random string

We need to get some random data throughout the process, and this is how we do
it here.

{% highlight python %}
    @property
    def random_stream(self):
        if not self._randf:
            self._randf = Crypto.Random.new()
        return self._randf
{% endhighlight %}


## Iterations

We vary the number of iterations that the KDF uses in a fairly complex way. The
strength of the KDF comes not only from a high number of iterations but from the
number being both unpredictable and increasing over time as computation power increases.

{% highlight python %}
    def _multiplier(self):
        """The multiplier to increase the KDF over time.

        The integer returned doubles every two years from 2013.
        """
        start = datetime(2013, 1, 1)
        now = datetime.now()
        return 2 ** ((now - start).days / 730.0)

    def _iterations(self):
        """The number of iterations for this KDF
        """
        # Increase exponentially, to grow with computation power
        base_iters = int(self.ITERATIONS_2013 * self._multiplier())

        # Entropy is an integer bound by min(65536, 6% of the base iters).
        # This is like a salt, but if the there is an attack that
        # reduces the size of the space for comparing derived keys
        # in spite of the salts proper, this variation not be so affected,
        # thus potentially increasing our resilience. While probably a rare
        # case, this is cheap.
        entropy = int(
            self.random_stream.read(2).encode('hex'), 16
        ) % int(base_iters * 0.06)

        # Return a sensible number of iterations;
        return base_iters + entropy
{% endhighlight %}


## Generating a key

Generating a key is straightforward application of the KDF. Note that this
would only be called internally by the `set_dk` or `verify` methods, below.

Even where one may get the iterations, we use a static offset
`ITER_OFFSET` – very slightly increasing our resilience.

{% highlight python %}
    def generate_dk(self, token):
        """Generate a defined key for a given token in hex
        >>> c = Credentials()
        >>> c.salt = 'abc'
        >>> c.iterations = 4
        >>> dk = c.generate_dk("password")
        >>> len(dk)
        64
        """
        return KDF.PBKDF2(token, self.salt, dkLen=self.DK_LEN,
                          count=self.iterations + self.ITER_OFFSET
                          ).encode('hex')
{% endhighlight %}


## Setting a key

When a user sets their password (in this case the `token` parameter), this is the function that is called. It sets the `iterations` and `salt` to new values, and then generates a key.

{% highlight python %}
    def set_dk(self, token):
        """Set the derived key from the given token, generating iterations
        and salt as necessary.

        >>> c = Credentials()
        >>> c.set_dk("password")
        >>> len(c.dk)
        64
        >>> len(c.salt)
        64
        >>> c.iterations >= c.ITERATIONS_2013
        True
        """
        self.iterations = self._iterations()
        self.salt = self.random_stream.read(32).encode('hex')
        self.dk = self.generate_dk(token)
{% endhighlight %}


## Verifying a key

When we receive a password (`token`) we run it through the algorithm with the parameters that correspond to the stored instance of the `Credentials` for the user the password is purported to belong to.

{% highlight python %}
    def verify(self, token):
        """Determine if the given token matches the saved token
        >>> c = Credentials()

        Fail when credentials have no dk
        >>> c.verify("password")

        # my name is my passport, verify me
        >>> c.set_dk("password")
        >>> c.verify("password")
        True

        # try a bad password
        >>> c.verify("not the password")
        False
        """
        if not self.dk:
            # If this user has no password, we cannot verify against it.
            # Our return value should still be falsy.
            return

        return self.dk == self.generate_dk(token)
{% endhighlight %}


## Reservations

Nothing is perfect. This is just a small piece of a security puzzle, and there are many other vectors one must bear in mind.

This does raise the bar for the specific concern where the stored secrets are divulged, and the risk then that the authentication they represent may be disclosed.

A number of improvements could be made to the above that I can think of. For example, storing the iterations and salt with the derived key partially (but not entirely) undermines their value if the database is slurped.

There may be inherent flaws in the algorithms that we employ here. The risk is usually in the form of short-circuits that reduce the computation time (and memory, in the case of scrypt) needed to verify a token.

Inherent issues may exist in the pseudo-random number generator that reduce the entropy of the cryptography and as a result reduce the computation time needed since the possible outcomes are significantly reduced.


# Summary

From the Wikipedia article on [Kerckoff's principle](http://en.wikipedia.org/wiki/Kerckhoffs's_principle), I quote [John Savard](http://www.quadibloc.com/crypto/mi0611.htm):

> Unlike a key, an algorithm can be studied and analyzed by experts to determine if it is likely to be secure. An algorithm that you have invented yourself and kept secret has not had the opportunity for such review.

I hope that you take away from this some illumination, if not inspiration and curiosity, about some important elements of storing passwords.

Any thoughts you have are most welcome!
