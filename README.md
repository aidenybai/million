<a href="https://millionjs.org">
  <img src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/banner.png" alt="Million Banner" />
</a>

<div align="center">
  <a href="https://img.shields.io/github/actions/workflow/status/aidenybai/million/ci.yml?branch=main" target="_blank"><img src="https://img.shields.io/github/actions/workflow/status/aidenybai/million/ci.yml?branch=main&style=flat&colorA=000000&colorB=000000" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/million" target="_blank"><img src="https://img.shields.io/npm/v/million?style=flat&colorA=000000&colorB=000000" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/million" target="_blank"><img src="https://img.shields.io/npm/dt/million.svg?style=flat&colorA=000000&colorB=000000" alt="NPM Downloads" /></a>
    <a href="https://www.npmjs.com/package/million" target="_blank">
    <img src="https://hits-app.vercel.app/hits?url=https://github.com/aidenybai/million&bgRight=000&bgLeft=000" />
  <a href="https://discord.gg/X9yFbcV2rF" target="_blank"><img src="https://img.shields.io/discord/938129049539186758?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff" /></a>

<table>
    <tbody>
      <tr>
        <td>
          <a href="https://millionjs.org">📚 Read the docs</a>
        </td>
        <td>
          <a href="https://www.youtube.com/watch?v=KgnSM9NbV2s">🎦 Watch video</a>
        </td>
        <td>
          <a href="https://discord.gg/X9yFbcV2rF">💬 Join our Discord</a>
        </td>
        <td>
          <a href="https://twitter.com/milliondotjs">🌐 Follow on Twitter</a>
        </td>
      </tr>
    </tbody>
  </table>
</div>

## What is Million?

Million is an extremely fast and lightweight (`<4kb`) virtual DOM that makes [React components](https://reactjs.org) up to [_**70% faster**_](https://krausest.github.io/js-framework-benchmark/current.html).

> Oh man... Another [`/virtual dom|javascript/gi`](https://regexr.com/6mr5f) framework? I'm fine with [React](https://reactjs.org) already, why do I need this?

Million works with React. Million makes creating web apps just as easy (It's just wrapping a [React](https://reactjs.org) component!), but with faster rendering and loading speeds. By using a fine-tuned, optimized virtual DOM, Million.js reduces the overhead of React ([_try it out here_](https://demo.millionjs.org))

**TL;DR:** Imagine [React](https://reactjs.org/) components running at the speed of raw JavaScript.

### [**📚 Learn Million in <5 minutes! →**](https://millionjs.org/)

## Installing Million

Inside your project directory, run the following command:

```sh
npm install million
```

## Example Usage

Million.js operates off of the concept of "blocks". Imagine blocks as special [Higher Order Components (HOCs)](https://legacy.reactjs.org/docs/higher-order-components.html) that you use in your React application, but are rendered using the Million.js virtual DOM.

In order to create blocks from your components, all you'll need to is **wrap your components in a `block()` function**. Below is an example of a React "counter" component that's been wrapped with Million.js.

```jsx
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { block } from 'million/react';

function Counter({ initialCount }) {
  const [count, setCount] = useState(initialCount);
  const handleClick = () => {
    setCount(count + 1);
  };

  return <button onClick={handleClick}>{count}</button>;
}

// Just wrap Counter in a block() function!
const CounterBlock = block(Counter);

createRoot(document.getElementById('root')).render(<CounterBlock />);
```

[**→ Try the quickstart**](https://millionjs.org/docs/quickstart)

## Codebase

This repo is a "mono-repo" with modules. Million ships as one NPM package, but has first class modules for more complex, but important extensions. Each module has its own folder in the `/packages` directory.

You can also track our progress through our [Roadmap](https://github.com/users/aidenybai/projects/5/views/1?layout=roadmap).

| Module                                                                               | Description                                          |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| [`million`](https://github.com/aidenybai/million/tree/main/packages/million)         | The main Virtual DOM with all of Million's core.     |
| [`react`](https://github.com/aidenybai/million/tree/main/packages/react)             | A module that gives React compatibility for Million. |
| [`compiler`](https://github.com/aidenybai/million/tree/main/packages/compiler)       | The compiler for Million in React.                   |
| [`jsx-runtime`](https://github.com/aidenybai/million/tree/main/packages/jsx-runtime) | A simple JSX runtime for Million core.               |

## Resources & Contributing Back

Looking for the docs? Check the [documentation](https://millionjs.org) or the [Contributing Guide](https://github.com/aidenybai/million/blob/main/.github/CONTRIBUTING.md) out.

Want to talk to the community? Hop in our [Discord](https://discord.gg/X9yFbcV2rF) and share your ideas and what you've build with Million.

Find a bug? Head over to our [issue tracker](https://github.com/aidenybai/million/issues) and we'll do our best to help. We love pull requests, too!

We expect all Million contributors to abide by the terms of our [Code of Conduct](https://github.com/aidenybai/million/blob/main/.github/CODE_OF_CONDUCT.md).

[**→ Start contributing on GitHub**](https://github.com/aidenybai/million/blob/main/.github/CONTRIBUTING.md)

## Sponsors

<p align="center">
  <a href="https://github.com/sponsors/aidenybai">
    <img src="https://raw.githubusercontent.com/aidenybai/aidenybai/master/sponsors.svg"/>
  </a>
</p>

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

Million is [MIT-licensed](LICENSE) open-source software by [Aiden Bai](https://aidenybai.com) and [contributors](https://github.com/aidenybai/million/graphs/contributors):

<a href="https://github.com/aidenybai/million/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=aidenybai/million" />
</a>

<br />

[![Powered by Vercel](https://raw.githubusercontent.com/abumalick/powered-by-vercel/master/powered-by-vercel.svg)](https://vercel.com?utm_source=millionjs&utm_campaign=oss)
