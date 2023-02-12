# `million/next`

Intended as a low-level virtual DOM to build a React compatible library + compiler on top of. It is not intended to be used directly.

## Basic Usage

```js
import { createBlock } from 'million/next';

const renderApp = createBlock((props) => {
  // note that props.foo isn't the actual value! it's a "Hole"
  // a special object that can be used to represent a value that
  // will be filled in later.
  return <div>{props.foo}</div>;
})

const app = renderApp({ foo: 'bar' });

app.mount(document.body);

const newApp = renderApp({ foo: 'NEW VALUE' });
app.patch(newApp);
```

## Fragments

```js
import { createBlock, fragment } from 'million/next';

const list = ['foo', 'bar', 'baz'];

const renderApp = createBlock((props) => {
  // fragment is a special block that can efficiently render lists!
  return (
    <ul>
      {fragment(
        list.map((item) => (
          <li key={item}>{item}</li>
        ))
      )}
    </ul>
  );
});
```

## Using `$wire` and `$once`

```js
import { createBlock, $wire, $once } from 'million/next';

const renderApp = createBlock((props) => {
  // note that you cannot interpolate a Hole directly, you must use a wire instead.
  // A wire is a special hole that can defer evaluation of the hole
  // $once only runs on mount, and then never again for patches
  return (
    <div>
      {/* ERROR: <button onClick={() => alert(props.foo)}></button>*/}
      <button onClick={$wire(({ foo }) => alert(foo))}>Click Me</button>
      <div>{$once(props.bar)}</div>
    </div>
  );
});
```