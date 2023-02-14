# `million/block`

A low-level primitive for building compiled virtual DOM-based interactions.

## Benchmarks

<img src="https://cloud-nwwgel7ih-hack-club-bot.vercel.app/0image.png" width="300" />

## Example Usage

```js
import { createBlock, fragment } from 'million/block';

const block = createBlock((props) => {
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
