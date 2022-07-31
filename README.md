<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/banner.svg">
  <img src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/banner-light.svg">
</picture>

<div align="center">
  <a href="https://github.com/aidenybai/million/actions/workflows/ci.yml" target="_blank"><img src="https://img.shields.io/github/workflow/status/aidenybai/million/CI?style=flat&colorA=000000&colorB=000000" alt="CI" /></a>
  <img src="https://badgen.net/badgesize/brotli/https/unpkg.com/million/dist/measurement/normal.js?color=000000&labelColor=00000&label=bundle%20size" alt="Code Size" />
  <a href="https://www.npmjs.com/package/million" target="_blank"><img src="https://img.shields.io/npm/v/million?style=flat&colorA=000000&colorB=000000" alt="NPM Version" /></a>
  <a href="https://coveralls.io/github/aidenybai/million" target="_blank"><img src="https://img.shields.io/coveralls/github/aidenybai/million?style=flat&colorA=000000&colorB=000000" /></a>
  <a href="https://discord.gg/X9yFbcV2rF" target="_blank"><img src="https://img.shields.io/discord/938129049539186758?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff" /></a>

  <table>
    <tbody>
      <tr>
        <td>
          <a href="https://www.youtube.com/watch?v=KgnSM9NbV2s">🎦 Watch Video</a>
        </td>
        <td>
          <a href="https://millionjs.org">📚 Read the docs</a>
        </td>
        <td>
          <a href="https://discord.gg/X9yFbcV2rF">💬 Join our Discord</a>
        </td>
      </tr>
    </tbody>
  </table>
</div>

## What is Million?

Million is a lightweight (`<1kb`) Virtual DOM. It's [_**really fast**_](https://millionjs.org/benchmarks) and makes it easy to create user interfaces.

> Oh man... Another [`/virtual dom|javascript/gim`](https://regexr.com/6mr5f) library? I'm fine with [React](https://reactjs.org) already, why should I bother switching?

Million makes creating user interfaces as easy as [React](https://reactjs.org), but with faster performance and smaller bundle size for the end user. By computing the user interface beforehand with a compiler, Million reduces the overhead of traditional Virtual DOM.

> Okay cool... but why should I use Million if I can just use [Preact](https://preactjs.com/) if I need something a bit more lightweight?

While alternative libraries like [Preact](https://preactjs.com/) reduce bundle sizes by efficient code design, Million takes it a step further by **leveraging compilation** to make a quantum leap in improving bundle size **and** render speed.

Think of it as if [React](https://preactjs.com/)'s API and [Svelte](https://svelte.dev/)'s compiler had a baby. [A baby with _**super speed! 👶🚀**_](https://millionjs.org/benchmarks)

### [**📚 Learn Million in 1 minute! →**](https://millionjs.org/docs/start-here)

## Why Million?

<table>
  <tbody>
    <tr>
      <td>
        <h3>Advantages</h3>
      </td>
      <td>
        <h3>Use Cases</h3>
      </td>
    </tr>
    <tr>
      <td>
        <ul>
          <li>⚛️ Familiar React API (with <code>million/react</code>)</li>
          <li>🦁 Built for libraries that <strong>compile</strong></li>
          <li>📦 Lightweight bundle size (<strong>&lt;1kb</strong> brotli+min)</li>
          <li>⚡ <strong>Fast</strong> runtime operations</li>
          <li>🛠️ <strong>Composable</strong> using drivers, <strong>sensible</strong> by default</li>
        </ul>
      </td>
      <td>
        <ul>
          <li><a href="https://github.com/aidenybai/million-react">Write React with a fast Virtual DOM </a></li>
          <li><a href="https://millionjs.org/docs/api/basics/render">Efficiently updating nodes</a></li>
          <li><a href="https://github.com/aidenybai/hacky">Creating UI libraries</a></li>
          <li><a href="https://millionjs.org/docs/api/extra/router">Turning MPAs into SPAs</a></li>
          <li><a href="https://millionjs.org/docs/tooling/ssg-ssr">Use granular HMR updates</a></li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

> **Note**: Million now supports [experimental React compatibility](https://github.com/aidenybai/million-react).

## Installing Million

Inside your project directory, run the following command:

```sh
npm install million
```

## Codebase

This repo is a "mono-repo" with modules. Million ships as one NPM package, but has first class modules for more complex, but important extensions. Each module has its own folder in the `/packages` directory.

| Module                                                                                               | Description                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`million`](https://github.com/aidenybai/million/tree/main/packages/million)                         | The main Virtual DOM with all of Million's core.                                                                                                                                              |
| [`react`](https://github.com/aidenybai/million/tree/main/packages/react)                             | A module that gives React compatability for Million.                                                                                                                                          |
| [`router`](https://github.com/aidenybai/million/tree/main/packages/router)                           | A module that enables SPA routing for MPAs.                                                                                                                                                   |
| [`jsx-runtime`](https://github.com/aidenybai/million/tree/main/packages/jsx-runtime)                 | A module that provides JSX runtime utilities                                                                                                                                                  |
| [`html`](https://github.com/aidenybai/million/tree/main/packages/html)                               | A module that provides factory functions and tagged template for easier virtual node creation (JSX alternative)                                                                               |
| [`morph`](https://github.com/aidenybai/million/tree/main/packages/morph)                             | A module for morphing HTML with just DOM nodes (like [morphdom](https://github.com/patrick-steele-idem/morphdom)) inside the page. Works great for implementing hot refresh in SSR frameworks |
| [`utils`](https://github.com/aidenybai/million/tree/main/packages/utils)                             | A module that provides conversion utilities for virtual nodes, DOM nodes, and HTML strings                                                                                                    |
| [`vite-plugin-million`](https://github.com/aidenybai/million/tree/main/packages/vite-plugin-million) | A Vite plugin that optimizes virtual node tree (**"the compiler"**)                                                                                                                           |

## Resources & Contributing Back

Looking for the docs? Check the [documentation](https://millionjs.org) out.

Want to talk to the community? Hop in our [Discord](https://discord.gg/X9yFbcV2rF) and share your ideas and what you've build with Million.

Have a question about Million? Post it on the [Discord](https://discord.gg/X9yFbcV2rF) or [GitHub Discussions](https://github.com/aidenybai/million/discussions) and ask the community for help.

Find a bug? Head over to our [issue tracker](https://github.com/aidenybai/million/issues) and we'll do our best to help. We love pull requests, too!

We expect all Million contributors to abide by the terms of our [Code of Conduct](https://github.com/aidenybai/million/blob/main/.github/CODE_OF_CONDUCT.md).

[**→ Start contributing on GitHub**](https://github.com/aidenybai/million/blob/main/.github/CONTRIBUTING.md)

## Acknowledgments

Million takes heavy inspiration from [snabbdom](https://github.com/snabbdom/snabbdom), [ivi](https://github.com/localvoid/ivi), [mikado](https://github.com/nextapps-de/mikado), [and more](https://krausest.github.io/js-framework-benchmark/2021/table_chrome_96.0.4664.45.html). Feel free to check them out if you're interested in an alternative library to use.

Million is being used at companies like [Wyze](https://wyze.com) and open source work like [Quartz](https://github.com/jackyzha0/quartz), [TinyPages](https://github.com/Borrus-sudo/tinypages), [and more](https://github.com/aidenybai/million/network/dependents).

## Sponsors

<table>
  <tr>
    <td>
      <a href="https://www.theatrejs.com/?utm_source=millionjs&utm_campaign=oss" target="_blank"><img height="44" src="https://www.theatrejs.com/images/top-section/logo.svg" alt="Theatre.js"></a>
    </td>
    <td>
      <a href="https://vercel.com/?utm_source=millionjs&utm_campaign=oss" target="_blank"><img height="44" src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/vercel-logo.svg" alt="Vercel"></a>
    </td>
    <td>
      <a href="https://deta.sh/?utm_source=millionjs&utm_campaign=oss" target="_blank"><img height="44" src="https://www.deta.sh/dist/images/deta_logo.svg" alt="Deta"></a>
    </td>
  </tr>
</table>
<br />

**Want your logo here? [→ Sponsor Million](https://github.com/sponsors/aidenybai)**

## License

Million is [MIT-licensed](LICENSE) open-source software and [research project](https://arxiv.org/abs/2202.08409) by [Aiden Bai](https://aidenybai.com).

![View count](https://hits.link/hits?url=https://github.com/aidenybai/million&bgRight=000&bgLeft=000)
