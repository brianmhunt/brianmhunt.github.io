---
layout: post
title: Open Source Exposure
description: >
  The quantum of liability associated with using open source
modified: 2014-02-16 11:25:01
tags:
  - law
  - economics
  - open source
image:
  feature: so-simple-sample-image-2.jpg
  credit: Michael Rose
  creditlink: http://mademistakes.com
comments: true
share: true
---

I draw the concept of **exposure** from my practice as a lawyer on insurance
matters. My practice in this area consisted predominantly of plaintiff work and
as counsel for the Queen in her role as an insurance payer of last resort in the
province of Ontario. The lingo and concept of exposure is a handy tool in
deciding whether and how to include open source software in a project.

[Black's Law Dictionary](http://en.wikipedia.org/wiki/Black's_Law_Dictionary), 7th edition, defines "exposure" as:

> *exposure.* The amount of liability or other risk to which a person is
> subject &lt;the client wanted to know its exposure before it made a
> settlement offer&gt;

The concept roughly translates into the **potential cost of a contingency**. Exposure says nothing about the probability of the contingency, just the cost should it come to pass.  In the insurance industry the [law of large numbers](http://en.wikipedia.org/wiki/Law_of_large_numbers) comes into play as insurers can produce accurate predictions of their aggregate exposure across a set of claims by essentially multiplying the exposure of each claim by the probability of that exposure.

The notion of exposure translates into the **potential costs** associated with using open source software when developing and designing a project. The exposure that can crystallize from choosing open source software include project delay, introduction of bugs and complexity, distraction from our core focus, loss of client confidence, investor wariness. Below is a cross-section of some of my experiences.

This is not to suggest that one should not use open source software. Only that there are **associated risks and costs**. The alternatives to using open source software include developing something in house, outsourcing development, forking and maintaining an existing project, and using equivalent commercial software. A rational choice will weigh the cost-benefit relationship of each of these, and in the case of open source options it is important to evaluate the potential exposure of doing so.

The **promise** of open source software is a peer-reviewed solution maintained by the community. Where an open source option lives up to that promise, it is often an excellent choice. jQuery, Flask, Bootstrap, Knockout.js have all proven mettle. There are many examples where it does not however, and the alure of the promise can allay the good judgment to deeply consider the cost.

The present-day **open source ecology** is vibrant, an incredible thing to
witness. Truly incredible. There is a thriving community of active developers
whose incentive is often as pure as can be imagined: the satisfaction of
creation. That said, if you are commercializing a project on a budget, open
source is not a panacea – one must be mindful of the costs associated with
employing open source.


# Loss of developers

If there is one **constant** of the software it is **change**. As software, services, platforms and frameworks change corresponding changes must be made to other software so that they continue to work together. There are two main reasons software ceases to be developed: deprecation and abandonment.


## Deprecation

The best example I can think of for deprecation is **Bootstrap Typeahead**. Bootstrap Typeahead provided an elegant and simple solution to the problem of automatically suggesting options for users to enter data into `<input>` and `<textarea>` fields. It was simply fabulous.

As of version 3.0, [Bootstrap](http://getbootstrap.com/) **removed its builtin Typeahead plugin**. Twitter came out with an independent plugin [Typeahead.js](http://twitter.github.io/typeahead.js/), but it was
[not entirely compatible](https://github.com/twitter/typeahead.js/issues/119) with its predecessor from Bootstrap. An alternative
plugin was developed, [Twitter Bootstrap Typeahead Plugin](https://github.com/tcrosen/twitter-bootstrap-typeahead), but I experienced issues with it and it is now unmaintained.

As I had chosen to extensively use Bootstrap's typeahead feature in NetPleadings the exposure was, which in my case crystallized, the following:

1. **Delay** upgrading from Bootstrap 2 to 3;
2. Big chunks of code needed **refactoring**;
3. **Uncertainty** of suitability of the Typeahead.js alternative.

None of this is to make a complaint about the incredible Bootstrap or Typeahead.js software. It is merely a **description of the costs** associated with my choice to use Bootstrap Typeahead.


## Abandonment

Curiously **Typeahead.js** also gives **an example** of abandonment. In addition to Typeahead.js not being compatible with Bootstrap's Typeahead, it was since [August 2013 through January 2014 unmaintained](https://github.com/twitter/typeahead.js/graphs/contributors?from=2013-07-07&to=2013-12-18&type=c).

Abandonment is the arguably the **most common occurrence** with all open source software as an aggregate production. People get busy and wander off once the glow, novelty and interest wanes. Developers get sick, die, change jobs, have families and children. The suitability of a project for a developer changes. Picking a project with longevity is a real art – you are really betting on the tenacity and capacity of the developers. The ecology of open source means that it is auto-correcting to a certain extent, though.

A truly useful project that is abandoned often has **the simplest cure: time**. If there is demand for the project, someone will pick up the torch and run with it. A great example is the now dead [git-flow](https://github.com/nvie/gitflow) project and its spiritual successor [git-flow-avh](https://github.com/petervanderdoes/gitflow). Another example: Jinja2 was [idle for quite some time](http://lucumr.pocoo.org/2013/5/21/porting-to-python-3-redux/), as Armin Ronacher (its author) was frustrated by making it simultaneously compatible with Python 2.x and 3.x. Over time Armin came back to the project. That said, the time between abandonment and a successor can be troublesome. Even temporary abandonment can have a cost.

Unfortunately in the case of Bootstrap Typeahead no successor suitable for our use has yet come to pass. I ended up **redesigning** our typeahead-equivalent functionalty entirely **in-house**. What we now have is much cleaner, simpler, and tailored to the experience we want to deliver. The time I dedicated to it gave me a much better understanding of the essential features of the user experience for automatically making suggestions on user input. That said, not everyone will have the luxury of taking the time for such a redesign.


# Novelty

The latest projects have the greatest uncertainty. Have they been vetted with major platforms? A great example of this problem is: The really awesome [Hubspot/Drop](https://github.com/HubSpot/drop) does [not work with Bootstrap modals](https://github.com/HubSpot/drop/issues/9). It is new, promises exellent functionality similar to [jQueryUI's position](http://jqueryui.com/position/), but without the heft of jQueryUI. It is aluring, but unproven. How will the developers hold up, respond to the community, assist in debugging and developing. Only time will tell.


# Imprecision

For years NetPleadings was based on **Django**, but I ended up **replacing every piece** of it over time until I switched entirely to Flask and Jinja2. It turns out others have [experienced exactly this](http://stackoverflow.com/a/3293509/19212).

> If you go with django, then in the long term, you will have to replace almost every single component of django with something else, the only remaining part will be the url mapper.
>  — hasenj

Django is a fabulous framework, but it turns out it was **unsuitable to the
style** of development I had. For how I work, Flask and
[Jinja2](http://stackoverflow.com/questions/4336713/) was a better – and narrower – fit.

Of course we had to rework our application to Flask from Django, but in reality this only took a couple days. It was well **worth the cost**; I used to fight with Django on a regular basis, using my very limited mental faculties on what should have been trite problems. Flask worked the way my mind thinks, and it provided a framework that matched our design aspirations so the bickering went away entirely. The psychological relief is a compelling consideration, worthy of a blog post on its own.


# Complexity

Speaking of psychology, some projects are simply too ambitious. I cannot relay how much time I wasted on **RequireJS**. I have blocked it out of my mind, but it is in the order of hundreds of hours, attempting to get it to work as documented. Unfortunately a combination of bad design, poor documentation, unforeseeable bugs, difficulty debugging and a slow test cycle made RequireJS an incredibly expensive choice. Using RequireJS added monumental unnecessary complexity on top of the client-side of our software, and I spent more time fighting with RequireJS than actually developing on our core product.

Of course for some RequireJS is a great answer, but it was not for me. The **promises** of simplified aggregation of our scripts and automatic compilation of Coffeescript was luring. Unfortunately though, RequireJS was such a time sink that I wrote [Yet Another Module Definition Optimizer](https://github.com/brianmhunt/yamdo) between debugging fits. Towards the end of my relationship with RequireJS it was locking up Google Chrome and crashing Firefox several times a day. Thankfully there was a very cool alternative: **Browserify**.

I changed our Coffeescript compiler and script aggregator to Browserify and have had **hardly a notable issue since**. It has taken a long time to make the change-over though, the tentacles of RequireJS ran deep. It has been over a year and I still find quirks meant to hack around issues with RequireJS. Thinking about the time wasted, loss of productivity, mental frustration, hit to client relations and investor confidence gives me heartache!


# Hard choices

It can often be **impossible to predict** the outcome of choosing between two similar open source solutions for a complex system. In 2011, who knew [jQuery would beat out Prototype](http://stackoverflow.com/questions/2644556)? One would hardly have expected at the time that jQuery would become ubiquitous, particularly since Prototype was the first to market. Both were so young and vibrant, solving real problems in elegant ways, but now Prototype is essentially a dead project.

Hind-sight is 20-20, but at the time I chose jQuery for NetPleadings it was really a **coin-toss**, with perhaps just the slightest touch of intuition. The choice saved ourselves substantial exposure refactoring from Prototype to jQuery – or relying on a dead project.


# Summary

As the saying goes **there's no such thing as a free lunch**. My regrets when
choosing or reflecting on open source are often posited opposite whether I should have developed something myself. Today the luxuries afforded by the open source ecosystem is truly a spectacle to behold. The rate at which problems are discovered and resolved is beyond reckoning.

That said, the concept of **exposure**, ingrained in my head from legal practice on insurance matters, is now constantly **in my mind**. Having had the precious benefit of some poor choices or unfortunate circumstances I have come to see an analogy with open source.  Whether I am maintaining NetPleadings, introducing new solutions, or just evaluating options, I concern myself with the nature of the cost of employing open source software. In doing so I have honed my senses to the **complexity** of the project, **motivations and capacity** of the developers, extent of **our reliance** on the project, difficulty with any prospective **refactoring**, what we have to do to determine the **likelihood of a failure**. All to say, I have developed a framework of considerations, and I hope I relay some of the benefit of my experiences and perspective through this article.

