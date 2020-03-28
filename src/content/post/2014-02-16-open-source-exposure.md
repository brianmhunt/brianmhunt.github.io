---
comments: true
date: "2014-02-16T00:00:00Z"
description: |
  The quantum of liability associated with using open source
image:
  credit: Michael Rose
  creditlink: https://mademistakes.com
  feature: so-simple-sample-image-2.jpg
modified: "2014-02-17 11:25:01"
share: true
tags:
- law
- economics
- open source
title: Open Source Exposure
---

The concept of **exposure** comes from my practice as a lawyer on insurance
matters. My practice in this area consisted predominantly of plaintiff work and
as counsel for the Queen of Canada (England) in her role as an insurance payer of
last resort in the province of Ontario. In insurance matters the word exposure is
a core concept used on a daily basis. I have found that the lingo and concept of
exposure is a handy tool in deciding whether and how to include open source
software in a project.

[Black's Law Dictionary](https://en.wikipedia.org/wiki/Black's_Law_Dictionary), 7th edition, defines "**exposure**" as:

> The amount of liability or other risk to which a person is
> subject &lt;the client wanted to know its exposure before it made a
> settlement offer&gt;

The concept roughly translates into the **potential cost of a contingency**. Exposure says nothing about the probability of the contingency, just the cost should it come to pass.

As a matter of interest, in the insurance industry the [law of large numbers](https://en.wikipedia.org/wiki/Law_of_large_numbers) helps insurers produce accurate predictions of their aggregate exposure across a set of claims by essentially multiplying the exposure of each claim by the probability of that exposure. In doing so they can set aside a predictable set of reserves, the funds necessary to cover the cost of future claims.

The notion of exposure translates into the **potential costs** associated with using open source software when developing and designing a project. The exposure that can crystallize from choosing open source software includes project delay, introduction of bugs and complexity, distraction from our core focus, loss of client confidence, investor wariness. Below is a cross-section of some of my experiences.

I do not mean to suggest that one should not use open source software. Only that there are associated risks and costs, that one is exposed to costs by using open source software and it is **good to be aware** of this exposure.

The **alternatives** to using open source software include developing something in house, outsourcing development, forking and maintaining an existing project, and using equivalent commercial software. A rational choice will weigh the cost-benefit relationship of each of these, and in the case of open source options it is important to evaluate the potential exposure of doing so.

The **promise** of open source software is a peer-reviewed solution maintained by the community. Where an open source option lives up to that promise, it is often an excellent choice. jQuery, Flask, Bootstrap, Knockout.js have all proven their mettle in my experience. There are many examples where it does not however, and the alure of the promise can allay the good judgment to deeply consider the cost.

The present-day **open source ecology** is vibrant, an incredible thing to
witness. Truly incredible. There is a thriving community of active developers
whose incentive is often as pure as can be imagined: the satisfaction of
creation. That said, if you are commercializing a project with limited resources, open source is not a panacea – one must be mindful of how using open source creates exposure.


# When the music stops

Sometimes open source software stops being developed. If there is one **constant** of the software it is **change**. As the collage of software, services, platforms and frameworks one uses changes, often a set of changes must be made to other software so that they continue to work together. When a piece of open source software stops being developed, it often becomes antiquated and ceases to work to satisfaction.

There are essentially two reasons software ceases to be developed: deprecation and abandonment.


## Deprecation

The best example I can think of for deprecation is **Bootstrap Typeahead**. Bootstrap Typeahead provided an elegant and simple solution to the problem of automatically suggesting options for users to enter data into `<input>` and `<textarea>` fields. It was simply fabulous, but it was explicitly deprecated.

As of version 3.0, [Bootstrap](https://getbootstrap.com/) **removed its builtin Typeahead plugin**. Twitter came out with an independent plugin [Typeahead.js](https://twitter.github.io/typeahead.js/), but it was
[not entirely compatible](https://github.com/twitter/typeahead.js/issues/119) with its predecessor from Bootstrap. An alternative
plugin was developed, [Twitter Bootstrap Typeahead Plugin](https://github.com/tcrosen/twitter-bootstrap-typeahead), but I experienced issues with it and it is now abandoned.

As I had chosen to extensively use Bootstrap's typeahead feature in NetPleadings the exposure was, which in my case crystallized, the following:

1. **Delay** upgrading from Bootstrap 2 to 3;
2. Big chunks of code needed **refactoring**;
3. **Uncertainty** of suitability of the Typeahead.js alternative.

None of this is to make a complaint about the incredible Bootstrap or Typeahead.js software. It is merely a **description of the exposure** associated with my choice to use Bootstrap Typeahead, which happened to come to pass.


## Abandonment

Curiously **Typeahead.js** also gives **an example** of abandonment. In addition to Typeahead.js not being compatible with Bootstrap's Typeahead, it was since [August 2013 through January 2014 unmaintained](https://github.com/twitter/typeahead.js/graphs/contributors?from=2013-07-07&to=2013-12-18&type=c).

Abandonment is the arguably the **most common occurrence** with all open source software as an aggregate production. People get busy and wander off once the glow, novelty and interest wanes. Developers get sick, die, change jobs, have families and children. The suitability of a project for a developer changes. Picking a project with longevity is a real art – you are really betting on the tenacity and capacity of the developers. The ecology of open source means that it is auto-correcting to a certain extent, though.

A truly useful project that is abandoned often has **the simplest cure: time**. If there is demand for the project, someone will pick up the torch and run with it. A great example is the now dead [git-flow](https://github.com/nvie/gitflow) project and its spiritual successor [git-flow-avh](https://github.com/petervanderdoes/gitflow). Another example: Jinja2 was [idle for quite some time](https://lucumr.pocoo.org/2013/5/21/porting-to-python-3-redux/), as Armin Ronacher (its author) was frustrated by making it simultaneously compatible with Python 2.x and 3.x. Over time Armin came back to the project. That said, the time between abandonment and a successor can be troublesome. Even temporary abandonment can have a cost.

Unfortunately in the case of Bootstrap Typeahead no successor suitable for our use has yet come to pass. I ended up **redesigning** our typeahead-equivalent functionalty entirely **in-house**. What we now have is much cleaner, simpler, and tailored to the experience we want to deliver. The time I dedicated to it gave me a much better understanding of the essential features of the user experience for automatically making suggestions on user input. That said, not everyone will have the luxury of taking the time for such a redesign.


# Novelty

The latest projects generally have the greatest **uncertainty**. Have they been vetted with major platforms? Do they solve a pain that inspires a community?

An example of the **novelty problem** is the really awesome [Hubspot/Drop](https://github.com/HubSpot/drop) plugin. Though it is fabulous, it does [not yet work with Bootstrap modals](https://github.com/HubSpot/drop/issues/9). It is new, promises exellent functionality similar to [jQueryUI's position](https://jqueryui.com/position/), but without the heft of jQueryUI. It is aluring, but unproven. The only way to find out if it works is to dedicate the time to **experimenting** with it. Only time will really tell.


# Imprecision

For years NetPleadings was based on **Django**, but I ended up **replacing every piece** of it over time until I switched entirely to Flask and Jinja2. This [quote rang true with me](https://stackoverflow.com/a/3293509/19212):

> If you go with django, then in the long term, you will have to replace almost every single component of django with something else, the only remaining part will be the url mapper.
>  — [hasenj](https://stackoverflow.com/users/35364/hasenj)

Django is a fabulous framework, but it turns out it was **unsuitable to the
style** of development I had. For how I work, Flask and
[Jinja2](https://stackoverflow.com/questions/4336713/) was a better – and narrower – fit.

Of course we had to rework our application to Flask from Django, but in reality this only took a couple days. It was well **worth the cost**; I used to fight with Django on a regular basis, using my very limited mental faculties on what should have been trite problems. Flask worked the way my mind thinks, and it provided a framework that matched our design aspirations so the bickering went away entirely. The psychological relief is a compelling consideration, worthy of a blog post on its own.


# Complexity

Speaking of psychology, some projects simply seem too ambitious. I cannot relay how much time I wasted on **RequireJS**. I have blocked it out of my mind, but it is in the order of hundreds of hours, attempting to get it to work as documented. Unfortunately a combination of bad design, poor documentation, unforeseeable bugs, difficulty debugging and a slow test cycle made RequireJS an incredibly expensive choice. Using RequireJS added monumental unnecessary complexity on top of the client-side of our software, and I spent more time making RequireJS work than making NetPleadings better.

Of course RequireJS is clever, for some RequireJS is a great answer, but for me it was a painful experience. The **promise** of simplified aggregation of our scripts and automatic compilation of Coffeescript was luring. Unfortunately though, RequireJS was such a time sink that I wrote [Yet Another Module Definition Optimizer](https://github.com/brianmhunt/yamdo) between debugging fits. Towards the end of my relationship with RequireJS it was locking up Google Chrome and crashing Firefox several times a day – basically it was unusable. It took an enormous investment to discover this.

Thankfully there was a very cool alternative: **Browserify**. I changed our Coffeescript compiler and script aggregator to Browserify and have had **hardly a notable issue since**. It has taken a long time to make the change-over though, the tentacles of RequireJS design ran deep. It has been over a year and I still find quirks meant to hack around issues with RequireJS. Thinking about the time wasted, loss of productivity, mental frustration, hit to client relations and investor confidence gives me heartache!

And so the exposure was substantially greater with RequireJS than most projects because it went to the **heart of the design** for our client-side code. It was
a costly experiment that ended in failure and the redesign was challenging and
time consuming.


# Hard choices

It can often be **impossible to predict** the outcome of choosing between two similar open source solutions for a complex system. Back in 2008-09, who knew [jQuery would beat out Prototype](https://stackoverflow.com/questions/2644556)? One would hardly have expected at the time that jQuery would become ubiquitous, particularly since Prototype was the first to market. Both were so young and vibrant, solving real problems in elegant ways. Now Prototype seems to be is a dead project.

Hind-sight is 20-20, but at the time I chose jQuery for NetPleadings it was really a **coin-toss**, with perhaps just the slightest touch of intuition. The choice saved ourselves substantial exposure refactoring from Prototype to jQuery – or relying on a dead project.


# Legal concerns

Of course one concern that I have not mentioned is exposure to **copyright infringement** where we would violate an open source license. Notable are some clauses of the [GNU GPL](https://www.gnu.org/copyleft/gpl.html), and though it is a legitimate consideration depending on your circumstances exposure to copyright infringement is beyond the scope of this article.


# Summary

As the saying goes **there's no such thing as a free lunch**. My concerns when
choosing or reflecting on open source are often posited opposite whether I should have developed something myself, with the exposure of redesign, delay, abandonment, deprecation and complexity the core considerations. The luxuries afforded by the open source ecosystem is truly a spectacle to behold, and the rate at which problems are discovered and resolved is beyond reckoning.

The concept of **exposure**, using the word regularly to describe the possible costs, serves as an interesting – if not useful – tool in the evaluation of whether or not to incorporate open source software.

Whether I am maintaining NetPleadings, introducing new solutions, or just evaluating options, I concern myself with the nature of the cost of employing open source software. In doing so I have developed some senses about the **complexity** of the project, **motivations and capacity** of the developers, extent of **our reliance** on the project, difficulty with any prospective **refactoring**, depth of experiment necessary to determine the **likelihood of a failure**. Which is all to say, I have developed a framework of considerations, and I hope through this article I have relay some of the benefit of my experiences and perspective.

