<a href="https://million.js.org">
  <img src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/banner.svg" />
</a>

<p align="center">
  <a href="https://github.com/aidenybai/million/actions/workflows/ci.yml" target="_blank"><img src="https://img.shields.io/github/workflow/status/aidenybai/million/CI?style=flat&colorA=000000&colorB=000000" alt="CI" /></a>
  <img src="https://badgen.net/badgesize/brotli/https/unpkg.com/million/dist/code-size-measurement.js?color=000000&labelColor=00000&label=bundle%20size" alt="Code Size" />
  <a href="https://www.npmjs.com/package/million" target="_blank"><img src="https://img.shields.io/npm/v/million?style=flat&colorA=000000&colorB=000000" alt="NPM Version" /></a>
  <a href="https://coveralls.io/github/aidenybai/million" target="_blank"><img src="https://img.shields.io/coveralls/github/aidenybai/million?style=flat&colorA=000000&colorB=000000" /></a>
  <a href="https://discord.gg/X9yFbcV2rF" target="_blank"><img src="https://img.shields.io/discord/938129049539186758?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff" /></a>
</p>

<p align="center">
by <a href="https://github.com/aidenybai">@aidenybai</a>
</p>

> Hi! Aiden here, author of Million. I hope you find it easy to use and powerful enough for all your use cases. If you have any issues or suggestions, please [open an issue](https://github.com/aidenybai/million/issues)!
>
> If you're interested in tuning into the development and future of Million, please **leave a star** :)
>
> -Aiden ([@aidenybai](https://github.com/aidenybai))

---

## What is Million?

Million is a **lightweight (`<1kb`)** compiler-augmented Virtual DOM. It's [**_fast_**](https://million.js.org/benchmarks)!

Current Virtual DOM implementations are **inadequate**—Ranging from overcomplicated to abandoned, most are unusable without sacrificing **raw performance and size**.

Million aims to fix this, providing a **library-agnostic** Virtual DOM to serve as the core for Javascript libraries that focus on pre**compilation** and static analysis.

#### ⮑ [**Learn Million in 10 minutes!**](https://million.js.org/docs/start-here) ⮐

## Why Million?

- 🦁 Built for libraries that **compile**
- 📦 Lightweight bundle size (**<1kb** brotli+min)
- ⚡ **Fast** runtime operations
- 🛠️ **Composable** using drivers, **sensible** by default

## Installing Million

Inside your project directory, run the following command:

```sh
npm install million
```

## Quick Start

Below is an extremely simple implementation of a Hello World page using Million.

```js
import { m, render } from 'million';

render(document.body, m('h1', undefined, ['Hello World!']));

// <p>Hello World</p> rendered to <body>
```

`render()` function has a standard interface that is used in many Virtual DOM libraries. First argument is a DOM node that will be used as the parent DOM reference, and the second one is a Virtual DOM to render.

`m()` function will instantiate a "Virtual DOM" node for an element.

[**→ More examples**](https://million.js.org/docs/quick-start)

## Resources & Contributing Back

Looking for the docs? Check the [documentation](https://million.js.org) out.

Want to talk to the community? Hop in our [Discord](https://discord.gg/X9yFbcV2rF) and share your ideas and what you've build with Million.

Have a question about Million? Post it on the [Discord](https://discord.gg/X9yFbcV2rF) or [GitHub Discussions](https://github.com/aidenybai/million/discussions) and ask the community for help.

Find a bug? Head over to our [issue tracker](https://github.com/aidenybai/million/issues) and we'll do our best to help. We love pull requests, too!

We expect all Million contributors to abide by the terms of our [Code of Conduct](https://github.com/aidenybai/million/blob/main/.github/CODE_OF_CONDUCT.md).

[**→ Start contributing on GitHub (`pnpm welcome`)**](https://github.com/aidenybai/million/blob/main/.github/CONTRIBUTING.md)

## Acknowledgments

Million takes heavy inspiration from [snabbdom](https://github.com/snabbdom/snabbdom), [ivi](https://github.com/localvoid/ivi), [mikado](https://github.com/nextapps-de/mikado), [and more](https://krausest.github.io/js-framework-benchmark/2021/table_chrome_96.0.4664.45.html). Feel free to check them out if you interested in an alternative library to use.

Million is being used by open source tools like [tinypages](https://github.com/Borrus-sudo/tinypages), [hacky](https://github.com/aidenybai/hacky), and [others](https://github.com/aidenybai/million/network/dependents).

## Sponsors

<a href="https://vercel.com/?utm_source=millionjs&utm_campaign=oss" target="_blank"><img height="44" src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/vercel-logo.svg" alt="Vercel"></a>

**Want your logo here? [→ Sponsor Million](https://github.com/sponsors/aidenybai)**

## License

Million is [MIT-licensed](LICENSE) open-source software and [research project](https://arxiv.org/abs/2202.08409) by [Aiden Bai](https://aidenybai.com).

---

_Why is it called "Million"? The name originated with the goal of being able to handle [1M+ ops/sec for benchmarks](https://github.com/aidenybai/million/tree/main/benchmarks#readme)._

_What is the logo? The logo stems from the suffix of Mil**LION**, and is a graphic of the nose and mouth of a lion._

![View count](https://hits.link/hits?url=https://github.com/aidenybai/million&bgRight=000&bgLeft=000)
