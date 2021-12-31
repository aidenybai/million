# <a href="https://million.js.org"><img src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/logo.svg" height="69" alt="Million Logo" aria-label="Million Logo" /></a>

English | [中文](https://github.com/aidenybai/million/blob/main/README-zh_CN.md)

### <1kb compiler-augmented virtual DOM. It's fast!

Current Virtual DOM implementations are inadequate—Ranging from overcomplicated to abandoned, most are unusable without sacrificing raw performance and size. Million aims to fix this, providing a library-agnostic Virtual DOM to serve as the core for Javascript libraries that focus on precompilation and static analysis.

[![CI](https://img.shields.io/github/workflow/status/aidenybai/million/CI?color=FF524C&labelColor=000&style=flat-square&label=build)](https://img.shields.io/github/workflow/status/aidenybai/million)
![Code Size](https://badgen.net/badgesize/brotli/https/unpkg.com/million/dist/code-size-measurement.js?style=flat-square&label=size&color=FF524C&labelColor=000) [![NPM Version](https://img.shields.io/npm/v/million?style=flat-square&color=FF524C&labelColor=000)](https://www.npmjs.com/package/million) ![Code Coverage](https://img.shields.io/coveralls/github/aidenybai/million?color=FF524C&labelColor=000&style=flat-square)

[**→ Check out the Million documentation**](https://million.js.org)

## Why Million?

- 🦁 Built for libraries that compile
- 📦 Lightweight bundle size (<1kb brotli+min)
- ⚡ Fast runtime operations
- 🛠️ Composable using drivers, sensible by default

## Installing Million

Million doesn't require [build tools by default](https://million.js.org/essentials/installation), but it is highly recommended you use NPM to install.

```sh
npm install million
```

## Hello World Example

Below is an extremely simple implementation of a Hello World page using Million.

```js
import { m, createElement, patch } from 'million';

// Initialize app
const app = createElement(m('div', { id: 'app' }, ['Hello World']));
document.body.appendChild(app);
// Patch content
patch(app, m('div', { id: 'app' }, ['Goodbye World']));
```

[**→ Check out more examples**](https://million.js.org)

## Sponsors

<a href="https://vercel.com/?utm_source=millionjs&utm_campaign=oss" target="_blank"><img height="44" src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/vercel-logo.svg" alt="Vercel"></a>

**Want your logo here? [→ Sponsor Million](https://github.com/sponsors/aidenybai)**

## Resources & Contributing Back

Looking for the docs? Check the [documentation](https://million.js.org) out.

Have a question about Million? Post it on the [GitHub Discussions](https://github.com/aidenybai/million/discussions) and ask the community for help.

Find a bug? Head over to our [issue tracker](https://github.com/aidenybai/million/issues) and we'll do our best to help. We love pull requests, too!

We expect all Million contributors to abide by the terms of our [Code of Conduct](https://github.com/aidenybai/million/blob/main/.github/CODE_OF_CONDUCT.md).

[**→ Start contributing on GitHub (`pnpm welcome`)**](https://github.com/aidenybai/million/blob/main/.github/CONTRIBUTING.md)

## Acknowledgments

Million takes heavy inspiration from [snabbdom](https://github.com/snabbdom/snabbdom), [ivi](https://github.com/localvoid/ivi), [mikado](https://github.com/nextapps-de/mikado), [and more](https://krausest.github.io/js-framework-benchmark/2021/table_chrome_96.0.4664.45.html). Feel free to check them out if you interested in an alternative library to use.

_Why is it called "Million"? The name originated with the goal of being able to handle [1M+ ops/sec for benchmarks](https://github.com/aidenybai/million/tree/main/benchmarks#readme)_.

## License

Million is [MIT-licensed](LICENSE) open-source software and [research](https://github.com/aidenybai/million/blob/main/.github/RESEARCH.md) by [Aiden Bai](https://github.com/aidenybai).

![View count](https://hits.link/hits?url=https://github.com/aidenybai/million)
