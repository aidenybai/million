# <img src="https://raw.githubusercontent.com/millionjs/million/main/.github/assets/logo.svg" height="60" alt="Million Logo" aria-label="Million Logo" />

### <1kb virtual DOM - it's fast!

Current Virtual DOM implementations are inadequate—Ranging from overcomplicated to abandoned, most are unusable without sacrificing raw performance and size. Million aims to fix this, providing a library-agnostic Virtual DOM to serve as the core for Javascript libraries.

[![CI](https://img.shields.io/github/workflow/status/millionjs/million/CI?color=FD9336&labelColor=000&style=flat-square&label=build)](https://img.shields.io/github/workflow/status/millionjs/million)
![Code Size](https://badgen.net/badgesize/brotli/https/unpkg.com/million?style=flat-square&label=size&color=A04A9C&labelColor=000) [![NPM Version](https://img.shields.io/npm/v/million?style=flat-square&color=4E82EE&labelColor=000)](https://www.npmjs.com/package/million) ![Code Coverage](https://img.shields.io/coveralls/github/millionjs/million?color=3CF5EB&labelColor=000&style=flat-square)

[**→ Check out the Million documentation**](https://million.js.org)

## Installing Million

Million doesn't require build tools by default, but it is highly recommended you use NPM to install.

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

[**→ Check out more examples**](https://github.com/millionjs/million/wiki)

## Resources & Contributing Back

Looking for the docs? Check the [documentation](https://million.js.org) out.

Have a question about Million? Post it on the [GitHub Discussions](https://github.com/millionjs/million/discussions) and ask the community for help.

Find a bug? Head over to our [issue tracker](https://github.com/millionjs/million/issues) and we'll do our best to help. We love pull requests, too!

We expect all Million contributors to abide by the terms of our [Code of Conduct](https://github.com/millionjs/million/blob/main/.github/CODE_OF_CONDUCT.md).

[**→ Start contributing on GitHub**](https://github.com/millionjs/million/blob/main/.github/CONTRIBUTING.md)

## Acknowledgments

Million is [MIT-licensed](LICENSE) open-source software by [Aiden Bai](https://github.com/aidenybai), [William Lane](https://github.com/willdoescode), [et al.](https://github.com/millionjs/million/graphs/contributors)

Million takes heavy inspiration from [React](https://github.com/facebook/react), and believes in the core philosophies and values behind [Lucia](https://github.com/aidenybai/lucia) and [Inferno](https://github.com/infernojs/inferno). Feel free to check them out if you interested in an alternative library to use.

_Why is it called "Million"? The name originated with the goal of being able to handle [1M+ ops/sec for benchmarks](https://github.com/millionjs/million/tree/main/benchmark#readme)_

---

© 2021 Aiden Bai, William Lane.
