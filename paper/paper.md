---
title: 'Million.js: A Fast, Compiler-Augmented Virtual DOM For Performant JavaScript UI Libraries'
tags:
  - javascript
  - ui framework
  - user interface
  - millionjs
  - virtual dom
  - react
  - compiler
  - static analysis
  - document object model
  - single page application
  - web programming
authors:
  - name: Aiden Bai
    orcid: 0000-0002-3676-3726
    affiliation: 1
affiliations:
  - name: Independent Researcher
    index: 1
date: 14 Feb 2022
bibliography: paper.bib
---

# Summary

The need for developing and delivering interactive web applications has grown rapidly. Thus, JavaScript User Interface (UI) libraries were introduced [@grov:2015], at the detriment of performance and bundle size. To solve this problem, Million.js was created to allow for the creation of compiler-augmented JavaScript UI libraries that are extensible, performant, and lightweight. This was accomplished by designing a computationally efficient diffing algorithm that relies on a compiler, and then measuring the performance with a series of relevant and exhaustive benchmarks.

The following mechanisms are built-in to allow for imperative or skip optimizations, reducing runtime diffing:

- **Keyed diffing:** Special diffing algorithm allows minimizes unnecessary DOM operations [@myers:1986; @hunt:1977]
- **Flags:** Allows patching algorithm to skip condition branches and regulates tree diffing behavior.
- **Deltas:** Hard coded imperative operations alongside diffing to optimize consistent operations.
- **Blocks:** Serialize blocks of virtual nodes to reduce memory usage.
- **Batching & Scheduling:** DOM operations are batched into an array, and can be scheduled to ensure 60 frames per second.

When compared to other methods of virtual DOM rendering, these findings showed that Million.js had higher benchmark metrics, with 133% to 300% more operations per second than other Virtual DOM libraries.

# Statement of need

Million is a Virtual DOM aimed at improving the performance of JavaScript UI libraries. It is designed to be a compiler-augmented JavaScript UI library, and is extensible to allow for complex functionality like components. The API for Million was designed to provide functional and composable building blocks for building modules for UI libraries.

Million was designed to be used by human-computer interaction (HCI) researchers for data visualization and web development. It is already being considered for use in Static Site Generators, which have the potential to allow for faster intereactive visualizations of data on the web.

# Related works

- [snabbdom](https://github.com/snabbdom/snabbdom): General purpose, composable virtual DOM library.
- [ivi](https://github.com/localvoid/ivi) - TypeScript UI library with virtual DOM aimed for optimizing reconciliation.
- [mikado](https://github.com/nextapps-de/mikado): Virtual-DOM based JavaScript UI library aimed for optimizing performance
- [blockdom](https://github.com/ged-odoo/blockdom): "Block"-based virtual DOM library

# References
