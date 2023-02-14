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
      <ul>{fragment(props.list.map((item) => <li key={item}>{item}</li>))}</ul>
    </div>
  );
});

const root = block({ title: 'Hello World', list: [] });

root.mount(document.body);

root.patch(block({ foo: 'Goodbye!', list: ['foo', 'bar', 'baz'] }));
```
