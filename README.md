<a href="https://million.dev">
  <img src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/banner.png" alt="Million.js Banner" />
</a>

<div align="center">
  <a href="https://img.shields.io/github/actions/workflow/status/aidenybai/million/ci.yml?branch=main" target="_blank"><img src="https://img.shields.io/github/actions/workflow/status/aidenybai/million/ci.yml?branch=main&style=flat&colorA=000000&colorB=000000" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/million" target="_blank"><img src="https://img.shields.io/npm/v/million?style=flat&colorA=000000&colorB=000000" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/million" target="_blank"><img src="https://img.shields.io/npm/dt/million.svg?style=flat&colorA=000000&colorB=000000" alt="NPM Downloads" /></a>
  <a href="https://discord.gg/X9yFbcV2rF" target="_blank"><img src="https://img.shields.io/discord/938129049539186758?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff" /></a>

<table>
    <tbody>
      <tr>
        <td>
          <a href="https://million.dev/docs/introduction">📚 Read the docs</a>
        </td>
        <td>
          <a href="https://www.youtube.com/watch?v=VkezQMb1DHw">🎦 Watch video</a>
        </td>
        <td>
          <a href="https://million.dev/chat">💬 Join our Discord</a>
        </td>
        <td>
          <a href="https://twitter.com/milliondotjs">🌐 Follow on Twitter</a>
        </td>
      </tr>
    </tbody>
  </table>
</div>

## What is Million.js?

Million.js is an extremely fast and lightweight optimizing compiler that make [components](https://react.dev) up to [_**70% faster**_](https://krausest.github.io/js-framework-benchmark/current.html).

> Oh man... Another [`/virtual dom|javascript/gi`](https://regexr.com/6mr5f) framework? I'm fine with [React](https://reactjs.org) already, why do I need this?

Million.js works with React and makes reconciliation faster. By using a fine-tuned, optimized virtual DOM, Million.js reduces the overhead of diffing ([_try it out here_](https://demo.million.dev))

**TL;DR:** Imagine [React](https://react.dev) components running at the speed of raw JavaScript.

### [**👉 Setup Million.js in seconds! →**](https://million.dev/)

## Installation

The Million.js CLI will automatically install the package and configure your project for you.

```bash
npx million@latest
```

Once your down, just run your project and information should show up in your command line!

> Having issues installing? [**→ View the installation guide**](https://million.dev/docs/install)

## Why Million.js?

To understand why to use Million.js, we need to understand how React updates interfaces. When an application's state or props change, React undergoes an update in two parts: rendering and reconciliation.

To show this, let's say this is our `App`:

```jsx
function App() {
  const [count, setCount] = useState(0);
  const increment = () => setCount(count + 1);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

In this `App`, when I click on the button, the `count` state will update and the `<p>` tag will update to reflect the new value. Let's break this down.

### Rendering

The first step is rendering. Rendering is the process of generating a snapshot of the current component. You can imagine it as simply "calling" the `App` function and storing the output in a variable. This is what the `App` snapshot would look like:

```jsx
const snapshot = App();

// snapshot =
<div>
  <p>Count: 1</p>
  <button onClick={increment}>Increment</button>
</div>;
```

### Reconciliation

In order to update the interface to reflect the new state, React needs to compare the previous snapshot to the new snapshot (_called "diffing"_). React's reconciler will go to each element in the previous snapshot and compare it to the new snapshot. If the element is the same, it will skip it. If the element is different, it will update it.

- The `<div>` tag is the same, so it doesn't need to be updated. ✅
  - The `<p>` tag is the same, so it doesn't needs to be updated. ✅
    - The text inside the `<p>` tag is different, so it needs to be updated. ⚠ ️
  - The `<button>` tag is the same, so it doesn't need to be updated. ✅
    - The `onClick` prop is the same, so it doesn't need to be updated. ✅
    - The text inside the `<button>` tag is the same, so it doesn't need to be updated. ✅

_(total: 6 diff checks)_

```diff
<div>
-  <p>Count: 0</p>
+  <p>Count: 1</p>
  <button onClick={increment}>Increment</button>
</div>
```

From here, we can see that the `<p>` tag needs to be updated. React will then update the `<p>` DOM node to reflect the new value.

```jsx
<p>.innerHTML = `Count: ${count}`;
```

### How Million.js makes this faster

React is slow.

The issue with React's reconciliation it becomes **exponentially slower** the more JSX elements you have. With this simple `App`, it only needs to diff a few elements. In a real world React app, you can easily have hundreds of elements, slowing down interface updates.

Million.js solves this by **skipping the diffing step entirely** and directly updating the DOM node.

Here is a conceptual example of how Million.js reconciler works:

```jsx
function App() {
  const [count, setCount] = useState(0);
  const increment = () => setCount(count + 1);

  // generated by compiler
  if (count !== prevCount) {
    <p>.innerHTML = `Count: ${count}`;
  }

  <button>.onclick = increment;

  // ...
}
```

Notice how when the `count` is updated, Million.js will directly update the DOM node. Million.js turns React reconciliation from `O(n)` (linear time) to `O(1)` (constant time).

> How fast is it? [**→ View the benchmarks**](https://krausest.github.io/js-framework-benchmark/current.html)

## Resources & Contributing Back

Looking for the docs? Check the [documentation](https://million.dev) or the [Contributing Guide](https://github.com/aidenybai/million/blob/main/.github/CONTRIBUTING.md) out. We also recommend reading [_Virtual DOM: Back in Block_](https://million.dev/blog/virtual-dom) to learn more about Million.js's internals.

Want to talk to the community? Hop in our [Discord](https://discord.gg/X9yFbcV2rF) and share your ideas and what you've build with Million.js.

Find a bug? Head over to our [issue tracker](https://github.com/aidenybai/million/issues) and we'll do our best to help. We love pull requests, too!

We expect all Million.js contributors to abide by the terms of our [Code of Conduct](https://github.com/aidenybai/million/blob/main/.github/CODE_OF_CONDUCT.md).

[**→ Start contributing on GitHub**](https://github.com/aidenybai/million/blob/main/.github/CONTRIBUTING.md)

![Alt](https://repobeats.axiom.co/api/embed/74a4b271e2a24c2cb08c897cfc1dfe155e0e1c1e.svg 'Repobeats analytics image')

## Codebase

This repo is a "mono-repo" with modules. Million.js ships as one NPM package, but has first class modules for more complex, but important extensions. Each module has its own folder in the `/packages` directory.

You can also track our progress through our [Roadmap](https://github.com/users/aidenybai/projects/5/views/1?layout=roadmap).

| Module                                                                                                                                                            | Description                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| [`million`](https://github.com/aidenybai/million/tree/main/packages/million)                                                                                      | The main Virtual DOM with all of Million.js's core. |
| [`react`](https://github.com/aidenybai/million/tree/main/packages/react) / [`react-server`](https://github.com/aidenybai/million/tree/main/packages/react-server) | React compatibility for Million.js.                 |
| [`compiler`](https://github.com/aidenybai/million/tree/main/packages/compiler)                                                                                    | The compiler for Million.js in React.               |
| [`jsx-runtime`](https://github.com/aidenybai/million/tree/main/packages/jsx-runtime)                                                                              | A simple JSX runtime for Million.js core.           |
| [`types`](https://github.com/aidenybai/million/tree/main/packages/types)                                                                                          | Shared types between packages                       |

## Sponsors

<p align="center">
  <a href="https://github.com/sponsors/aidenybai">
    <img src="https://raw.githubusercontent.com/aidenybai/aidenybai/master/sponsors.svg" />
  </a>
  <a href="https://vercel.com?utm_source=millionjs&utm_campaign=oss"><img height="30" src="https://raw.githubusercontent.com/abumalick/powered-by-vercel/master/powered-by-vercel.svg" /></a>
</p>

## Acknowledgments

Million.js takes heavy inspiration from the following projects:

- [`blockdom`](https://github.com/ged-odoo/blockdom) ([Géry Debongnie](https://github.com/ged-odoo))
  Thank you to Géry pioneering the concept of "blocks" in the virtual DOM. Many parts of the Million.js codebase either directly or indirectly derive from his work.
- [`voby`](https://github.com/vobyjs/voby) ([Fabio Spampinato](https://github.com/fabiospampinato))
  The Million.js "template" concept is derived from Voby's `template()` API.
- [Hack the Wave](https://hackthewave.com) ([Melinda Chang](https://github.com/melindachang)) for their homepage.
- [`react`](https://react.dev) and [`turbo`](https://turbo.build) for their documentation. Many parts of the current Million.js documentation are grokked and modified from theirs.
- [`ivi`](https://github.com/localvoid/ivi), [Preact](https://github.com/preactjs/preact), [and more](https://krausest.github.io/js-framework-benchmark/2021/table_chrome_96.0.4664.45.html)

## License

Million.js is [MIT-licensed](LICENSE) open-source software by [Aiden Bai](https://aiden.mov) and [contributors](https://github.com/aidenybai/million/graphs/contributors):

<a href="https://github.com/aidenybai/million/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=aidenybai/million" />
</a>
