---
layout: post
title: "Picking our roots: Between HSTS and public key pins"
date: "2015-11-25 09:19"
---


The web browser encryption meta-game has stepped up in the wake of the Snowden publications.

One very useful advancement called [HTTP Strict Transport Security](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security) appears to be catching on.  Simply, HSTS tells a browser to remember that the website should always in the future be encrypted.  After a browser receives a HSTS header for a website any subsequent connection will fail if it is not encrypted, until the header expires.  This means that any misconfiguration or malicious attempt to downgrade a connection from HTTPS to HTTP shall fail.

HSTS ensures sites are encrypted.  However even where encrypted there are weaknesses in the common pattern by which connections are made to sites over the Internet. For example, connections can be encrypted and appear to be valid and private with the site because the connection is signed by a root (or intemediary) certificate authority that essentially declares as such. However a root or trusted intermediate authority (not necessarily the one who validated the certificate for the site administrators) can validate a counterfeit certificate.  With a counterfeit certificate a [man-in-the-middle](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) attack becomes possible.

A feature related to HSTS but more ambitious is called [Public key pins](https://ipsec.pl/ssl/2014/public-key-pins-new-safeguard-https-websites.html) (*PKPs*) and it is defined in [RFC7469](https://tools.ietf.org/html/rfc7469). PKP helps deal with the counterfeit-certificate problem described above. However, it does not yet appear to be worth its while – for reasons described below.

The idea with PKPs is that one embeds into the headers a hash of a set of trusted keys, like this:

```
Public-Key-Pins: max-age=3000;
    pin-sha256="d6qzRu9zOECb90Uez27xWltNsj0e1Md7GkYYkVoZWmM=";
    pin-sha256="E9CZ9INDbd+2eRQozYqqbQ2yXLVKB9+xcprMF+44U1g="
```

The browser remembers these keys.  They are "pinned", in PKP lingo.  After the first connection the certificate must match on any future connection lest the connection fail – just as it would fail if an unencrypted connection is made to a site that previously served HSTS headers.  The benefit of PKP is clear, and has immediate application in the real world.

PKP could have prevented [China Internet Network Information Center](https://www1.cnnic.cn/index.htm), a trusted root authority, from [issuing a counterfeit Google certificate](https://techcrunch.com/2015/04/01/google-cnnic/) – which made Google's website appear to be a valid, private, encrypted connection yet the connections to Google could easily have been intercepted by a man-in-the-middle with that counterfeit root certificate.  CINIC getting caught resulted in the [removal of their root authority](https://arstechnica.com/security/2015/04/google-chrome-will-banish-chinese-certificate-authority-for-breach-of-trust/) for all of Google's and Mozilla products.

This is not the first time, nor the most recent, that a root certificate authority has been brought into question.  Mozilla did the same in 2011 after [DigiNotar was compromised](https://www.theregister.co.uk/2011/09/08/mozilla_certificate_authority_audit/) and issued at least 531 counterfeit certificates, and similarly Google has [just recently threatened Symantec](https://www.theregister.co.uk/2015/10/29/google_symantec_dodgy_certs/) with similar consequences.

Which is all to say that the trustability of some root certificate authorities is coming into question, for political reasons as well as ones of competence. Nevertheless, all root certificate authorities have plenary authority to issue certificates that appear to be trusted to end-users.

The key upside of PKP is that it prevents man-in-the-middle attacks of the sort above, where root authorities issue counterfeit certificates.  The inherent problem with PKPs is that it feels daunting and impractical.  The key issues (pardon the pun) has a few folds:

1. For a site that regularly re-issues certificates ([and some argue it should](https://letsencrypt.org/2015/11/09/why-90-days.html), some [otherwise](https://community.letsencrypt.org/t/pros-and-cons-of-90-day-certificate-lifetimes/4621)), the list becomes prohibitively long, or the expiry quite short, and in either case unwieldy.  The PKP header would have to store every past unexpired version of the certificates to ensure that users who have not been to the site in a long time still have access.  Where the expiry is short, then users who have not connected in a long time may be exposed to interception (since the pinning requirement will have expired).

2. The site administrator must have two private keys – the main key and a backup.  The idea is that if the main is lost or compromised the site can continue to operate.  Ideally these keys should be stored separately, with different security considerations, but practically speaking this is rather unlikely for many administrators.

3. If both keys are lost, the site becomes inaccessible until the PKP age expires.  Many will set the age to the max.

4. If one mucks up typing or copying in the hash and deploying then it can ruin the site.  Statistically, if PKP catches on, this is bound to happen. Hash keys are notoriously un-human-brain friendly i.e. we are not good at identifying spelling or other errors in hashes.  Typos can occur anywhere, but human brains tend to be better at detecting misspellings of words.

Failures that lead to a site becoming inaccessible may create bad press for what is a valuable security feature. That plays out poorly for the pro-security side of the meta-game.  Optically, to some, it is better to be hacked by the malicious than risk being perceived incompetent for killing ones own site.

The PKP specification does permit pinning to a root or intermediary certificate.  However the key must be specific to the SHA-256 hashes.

I think there is a simpler advancement of security in between HSTS and PKP:  specifying the trusted certificates by attributes.  In particular, specifying for a given web-site, via HTTP headers or HTML attribute, a list of [attributes](https://en.wikipedia.org/wiki/X.509) of the root certificates trusted.

For example, in HTTP headers:

```
Public-Key-Matches: max-age: 35000;
   ou="GlobalSign";
   cn="Staat der Nederlanden Root CA" ou="Staat der Nederlanden";
   serial="00 F2 FA 64 E2 74 63 D3 8D FD 10 1D 04 1F 76 CA 58";
   sha1="AA DB BC 22 23 8F C4 01 A1 27 BB 38 DD F4 1D DB 08 9E F0 12";
   pin-sha256="E9CZ9INDbd+2eRQozYqqbQ2yXLVKB9+xcprMF+44U1g=";
   recovery-fallback-uri: recovery.globalsign.com/my-username
```

This is merely a made-up HTTP header for demonstration purposes, but it illustrates some of the attributes over which it makes sense to be able to pick trusted root certificates.  In the above, any root certificates by GlobalSign or Staat der Nederlanden (with common name Staat der Nederlanden Root CA), the certificate matching serial `00 F2 FA 64 E2 74 63 D3 8D FD 10 1D 04 1F 76 CA 58` and the one with a SHA1 of `AA DB BC 22 23 8F C4 01 A1 27 BB 38 DD F4 1D DB 08 9E F0 12` would all be permitted, as would the PKP-style pin.

In case it is unclear, the matches are not *adding* root certificates, but performing a "grep" of the root certificates already in the system that match the corresponding attributes.  Once a browser connects to a site, any future connection shall require a certificate signed by one of the matching roots.

There is also a `recovery-fallback-uri`, which specifies a site for browsers to check when the certificate being used by a site fails the test.  That site should 1.) match the certificate restrictions of the current site; and b.) serve an alternative list of valid certificates (in e.g. JSON form).  This optional setting provides a mechanism for recovery; I have provided a fake `recovery.globalsign.com` site, on the basis that I believe that this is an ancillary service that trusted certificate providers might offer (though the provider of such service ought to be different than the authority that signs any certificate that may be revoked or replaced).

One might think of this proposal, in a sense, as PKP-"glob" with a recovery option.

The `recovery-fallback-uri` solves the problem of a certificate authority losing its trust (i.e. having potentially issued a counterfeit certificate).  When a connection fails because the certificate does not have a matching signing authority, that is the end of the game for PKP.  However providing an external fallback-site that provides an updated list of matching certificates lets sites immediately change their certificates – without having to wait for previous headers to expire, leaving the site open to man-in-the-middle in the interim.

The noteworthy advancement, in the meta-game, is that this makes it easier to specify a reasonable set of root certificate issuers who site administrators trust.  With the proposal above, one advances the security of connections without the cost of regularly re-issuing certificates, the challenge with properly maintaining a backup key, the fear of hash-typos or losing the keys are not concerns in this model.

In the security meta-game, ease of use is king.
