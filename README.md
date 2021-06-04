# <img src="https://raw.githubusercontent.com/millionjs/million/main/.github/assets/logo.svg" height="60" alt="Million Logo" aria-label="Million Logo" />

### <1kb virtual DOM - it's fast!

Current Virtual DOM implementations are too complicated—Whether it be a fully featured yet bloated Virtual DOM in React, or the deprecated `virtual-dom` package on NPM, they are basically unusable without sacrificing raw performance and size. Million aims to do this, providing a library-agnostic Virtual DOM to serve as the core for Javascript libraries.

![Code Size](https://badgen.net/badgesize/brotli/https/unpkg.com/million?style=flat-square&label=size) ![NPM Version](https://img.shields.io/npm/v/million?style=flat-square)

## Installing Million

Million doesn't require build tools by default, feel free to just drop a script tag in the head of your webpage.

```html
<script src="https://unpkg.com/million"></script>
```

It also integrates well with module bundlers like [Webpack](https://webpack.js.org/) or [Rollup](https://rollupjs.org/), just install via npm.

## Hello World Example

Below is an extremely simple implementation of a Hello World page using Million.

```html
<div id="app"></div>

<script>
  const { m, patch } = Million;
  const newVNode = m('div', { id: 'app' }, ['Hello World']);
  const el = document.querySelector('#app');
  patch(newVNode, el);
</script>
```

## Resources & Contributing Back

Have a question about Million? Post it on the [GitHub Discussions](https://github.com/millionjs/million/discussions) and ask the community for help.

Find a bug? Head over to our [issue tracker](https://github.com/millionjs/million/issues) and we'll do our best to help. We love pull requests, too!

## Acknowledgments

Million is [MIT-licensed](LICENSE) open-source software by [Aiden Bai](https://github.com/aidenybai) [et al.](https://github.com/millionjs/million/graphs/contributors)

Million takes heavy inspiration from [React](https://github.com/facebook/react), and believes in the core philosophies and values behind [Lucia](https://github.com/aidenybai/lucia) and [Inferno](https://github.com/infernojs/inferno). Feel free to check them out if you interested in an alternative library to use.

---

© 2021 Aiden Bai.
