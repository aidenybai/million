# <img src="https://raw.githubusercontent.com/millionjs/million/main/.github/assets/logo.svg" height="60" alt="Million Logo" aria-label="Million Logo" />

### <1kb virtual DOM - it's fast!

Current Virtual DOM implementations are inadequate—Ranging from overcomplicated to abandoned, most are unusable without sacrificing raw performance and size. Million aims to fix this, providing a library-agnostic Virtual DOM to serve as the core for Javascript libraries.

![Code Size](https://badgen.net/badgesize/brotli/https/unpkg.com/million?style=flat-square&label=size) ![NPM Version](https://img.shields.io/npm/v/million?style=flat-square)

## Installing Million

Million doesn't require build tools by default, feel free to just drop a script tag in the head of your webpage.

```html
<script src="https://unpkg.com/million"></script>
```

It also integrates well with module bundlers like [Webpack](https://webpack.js.org/) or [Rollup](https://rollupjs.org/), just install via npm.

## Hello/Goodbye World Example

Below is an extremely simple implementation of a Hello World page using Million.

```js
import { m, createElement, patch } from 'million';

// Initialize app
const app = createElement(m('div', { id: 'app' }, ['Hello World']));
document.body.appendChild(app);
// Patch content
patch(app, m('div', { id: 'app' }, ['Goodbye World']));
```

## Resources & Contributing Back

Have a question about Million? Post it on the [GitHub Discussions](https://github.com/millionjs/million/discussions) and ask the community for help.

Find a bug? Head over to our [issue tracker](https://github.com/millionjs/million/issues) and we'll do our best to help. We love pull requests, too!

## Acknowledgments

Million is [MIT-licensed](LICENSE) open-source software by [Aiden Bai](https://github.com/aidenybai) [et al.](https://github.com/millionjs/million/graphs/contributors)

Million takes heavy inspiration from [React](https://github.com/facebook/react), and believes in the core philosophies and values behind [Lucia](https://github.com/aidenybai/lucia) and [Inferno](https://github.com/infernojs/inferno). Feel free to check them out if you interested in an alternative library to use.

_Why is it called "Million"? The name originated for the goal of being able to handle 1m+ ops/s for benchmarks_

---

© 2021 Aiden Bai.
