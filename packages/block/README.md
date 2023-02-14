> **Warning**:
> This is a work in progress. The API is not stable and may change at any time.

# `million/block`

A low-level primitive for building compiled virtual DOM-based interactions.

## Benchmarks

<img src="https://cloud-nwwgel7ih-hack-club-bot.vercel.app/0image.png" width="300" />

## Example Usage

Inside the `/dev` folder, put the following code in `index.js`:

```js
import { createBlock, fragment } from 'packages/block';

const block = createBlock((props) => {
  // Any prop within props isn't the actual value, it's a "Hole"
  // always interpolate into the JSX.
  return (
    <div>
      <h1>{props.title}</h1>
      <ul>{props.list}</ul>
    </div>
  );
});

const row = createBlock(({ value }) => {
  return <li>{value}</li>;
});

const root = block({ title: 'Hello World', list: fragment([]) });

root.mount(document.body);

root.patch(
  block({
    title: 'Goodbye!',
    list: fragment(['foo', 'bar', 'baz'].map((value) => row({ value }))),
  }),
);
```

## Acknowledgements

This library is heavily inspired by [Voby](https://github.com/vobyjs/voby), [Blockdom](https://github.com/ged-odoo/blockdom), [ivi](https://github.com/localvoid/ivi), and [Preact](https://github.com/preactjs/preact), with many elements and concepts borrowed from each.
