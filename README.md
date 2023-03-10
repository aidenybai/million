<a href="https://millionjs.org">
  <img src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/banner.png" alt="Million Banner" />
</a>

<div align="center">
  <a href="https://img.shields.io/github/actions/workflow/status/aidenybai/million/ci.yml?branch=main" target="_blank"><img src="https://img.shields.io/github/actions/workflow/status/aidenybai/million/ci.yml?branch=main&style=flat&colorA=000000&colorB=000000" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/million" target="_blank"><img src="https://img.shields.io/npm/v/million?style=flat&colorA=000000&colorB=000000" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/million" target="_blank"><img src="https://img.shields.io/npm/dt/million.svg?style=flat&colorA=000000&colorB=000000" alt="NPM Downloads" /></a>
    <a href="https://www.npmjs.com/package/million" target="_blank">
  <a href="https://discord.gg/X9yFbcV2rF" target="_blank"><img src="https://img.shields.io/discord/938129049539186758?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff" /></a>

  <table>
    <tbody>
      <tr>
        <td>
          <a href="https://millionjs.org">📚 Read the docs</a>
        </td>
        <td>
          <a href="https://www.youtube.com/watch?v=KgnSM9NbV2s">🎦 Watch Video</a>
        </td>
        <td>
          <a href="https://discord.gg/X9yFbcV2rF">💬 Join our Discord</a>
        </td>
      </tr>
    </tbody>
  </table>
</div>

## What is Million?

Million is an extremely fast and lightweight (`<4kb`) virtual DOM that makes [React](https://reactjs.org) up to [_**70% faster**_](https://millionjs.org).

> Oh man... Another [`/virtual dom|javascript/gi`](https://regexr.com/6mr5f) library? I'm fine with [React](https://reactjs.org) already, why should I need it?

Million makes creating user interfaces as easy (It's just [React](https://reactjs.org)!), but with faster rendering and loading speeds. By using a fine-tuned, optimized virtual DOM, Million.js reduces the overhead of the React Reconciler.

Furthermore, while alternative libraries like [Preact](https://preactjs.com/) reduce bundle sizes via efficient code design, Million.js can be used inside [React](https://reactjs.org) and is much faster than Preact.

**TL;DR:** Imagine [React](https://preactjs.com/) at the speed of raw JavaScript.

### [**📚 Learn Million in <5 minutes! →**](https://millionjs.org)

## Installing Million

Inside your project directory, run the following command:

```sh
npm install million
```

## Codebase

This repo is a "mono-repo" with modules. Million ships as one NPM package, but has first class modules for more complex, but important extensions. Each module has its own folder in the `/packages` directory.

You can also track our progress through our [Roadmap](https://github.com/users/aidenybai/projects/5/views/1?layout=roadmap).

| Module                                                                               | Description                                          |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| [`million`](https://github.com/aidenybai/million/tree/main/packages/million)         | The main Virtual DOM with all of Million's core.     |
| [`react`](https://github.com/aidenybai/million/tree/main/packages/react)             | A module that gives React compatibility for Million. |
| [`compiler`](https://github.com/aidenybai/million/tree/main/packages/compiler)       | An optimizing compiler for Million in React.         |
| [`jsx-runtime`](https://github.com/aidenybai/million/tree/main/packages/jsx-runtime) | A simple JSX runtime for Million core.               |

## Resources & Contributing Back

Looking for the docs? Check the [documentation](https://millionjs.org) out.

Want to talk to the community? Hop in our [Discord](https://discord.gg/X9yFbcV2rF) and share your ideas and what you've build with Million.

Have a question about Million? Post it on the [Discord](https://discord.gg/X9yFbcV2rF) or [GitHub Discussions](https://github.com/aidenybai/million/discussions) and ask the community for help.

Find a bug? Head over to our [issue tracker](https://github.com/aidenybai/million/issues) and we'll do our best to help. We love pull requests, too!

We expect all Million contributors to abide by the terms of our [Code of Conduct](https://github.com/aidenybai/million/blob/main/.github/CODE_OF_CONDUCT.md).

[**→ Start contributing on GitHub**](https://github.com/aidenybai/million/blob/main/.github/CONTRIBUTING.md)

## Acknowledgments

Million takes heavy inspiration from the following projects:

- [`blockdom`](https://github.com/ged-odoo/blockdom) ([Géry Debongnie](https://github.com/ged-odoo))
  Thank you to Géry pioneering the concept of "blocks" in the virtual DOM. Many parts of the Million.js codebase either directly or indirectly derive from his work.

- [`voby`](https://github.com/vobyjs/voby) ([Fabio Spampinato](https://github.com/fabiospampinato))
  The Million.js "template" concept is derived from Voby's `template()` API.

- [`bun`](https://bun.sh) for their homepage. The Million.js homepage is a remix of what they have currently.

- [`ivi`](https://github.com/localvoid/ivi), [Preact](https://github.com/preactjs/preact), [and more](https://krausest.github.io/js-framework-benchmark/2021/table_chrome_96.0.4664.45.html)

Million is being used at companies like [Wyze](https://wyze.com) and [Dimension](https://dimension.dev), as well as open source work like [Quartz](https://github.com/jackyzha0/quartz), [TinyPages](https://github.com/Borrus-sudo/tinypages), [and more](https://github.com/aidenybai/million/network/dependents).

## License

Million is [MIT-licensed](LICENSE) open-source software by [Aiden Bai](https://aidenybai.com).

![View count](https://hits-app.vercel.app/hits?url=https://github.com/aidenybai/million&bgRight=000&bgLeft=000)
