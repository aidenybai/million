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

| Module                                                                               | Description                                          |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| [`million`](https://github.com/aidenybai/million/tree/main/packages/million)         | The main Virtual DOM with all of Million's core.     |
| [`react`](https://github.com/aidenybai/million/tree/main/packages/react)             | A module that gives React compatibility for Million. |
| [`jsx-runtime`](https://github.com/aidenybai/million/tree/main/packages/jsx-runtime) | A simple JSX runtime for Million.js core.            |

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

## Sponsors

<table>
  <tr>
    <td>
      <a href="https://dimension.dev/?utm_source=millionjs&utm_campaign=oss" target="_blank"><img height="44" src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/dimension-logo.svg" alt="Dimension"></a>
    </td>
    <td>
      <a href="https://www.theatrejs.com/?utm_source=millionjs&utm_campaign=oss" target="_blank"><img height="44" src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/theatre-js-logo.svg" alt="Theatre.js"></a>
    </td>
    <td>
      <a href="https://deta.sh/?utm_source=millionjs&utm_campaign=oss" target="_blank">
      <svg style="height: 44px" width="44px" height="44px" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.00004 0C10.866 0 14 3.13401 14 7C14 10.866 10.866 14 7.00004 14C3.13401 14 0 10.866 0 7C0 3.13401 3.13401 0 7.00004 0Z" fill="#F73B95"></path>
        <path d="M7.01678 1.36719C10.1464 1.36719 12.6834 3.90424 12.6834 7.03387C12.6834 10.1635 10.1464 12.7005 7.01678 12.7005C3.88717 12.7005 1.3501 10.1635 1.3501 7.03387C1.3501 3.90424 3.88717 1.36719 7.01678 1.36719Z" fill="#BD399C"></path>
        <path d="M7.01674 2.86719C9.3179 2.86719 11.1834 4.73263 11.1834 7.03387C11.1834 9.33507 9.3179 11.2005 7.01674 11.2005C4.71554 11.2005 2.8501 9.33507 2.8501 7.03387C2.8501 4.73263 4.71554 2.86719 7.01674 2.86719V2.86719Z" fill="#93388E"></path>
        <path d="M6.98322 4.13281C8.54798 4.13281 9.81654 5.40133 9.81654 6.96613C9.81654 8.53089 8.54798 9.79945 6.98322 9.79945C5.41846 9.79945 4.1499 8.53089 4.1499 6.96613C4.1499 5.40133 5.41846 4.13281 6.98322 4.13281V4.13281Z" fill="#6030A2"></path>
      </svg>
    </a>
    </td>
    <td>
      <a href="https://vercel.com/?utm_source=millionjs&utm_campaign=oss" target="_blank"><img height="44" src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/vercel-logo.svg" alt="Vercel"></a>
    </td>
  </tr>
</table>
<br />

**Want your logo here? [→ Sponsor Million](https://github.com/sponsors/aidenybai)**

## License

Million is [MIT-licensed](LICENSE) open-source software by [Aiden Bai](https://aidenybai.com).

![View count](https://hits-app.vercel.app/hits?url=https://github.com/aidenybai/million&bgRight=000&bgLeft=000)
