> _Adapted from [aidenybai/tiny-vdom](https://github.com/aidenybai/tiny-vdom) to support Million-based vnodes_

---

# `tiny-vdom`

Smallest possible virtual DOM implementation.

> Note: If you're looking for something a bit more comprehensive, check out [Million](https://github.com/aidenybai/million)

## Installation

```sh
npm install tiny-vdom
```

## Usage

`index.js`

```js
import { h, createElement, patch } from 'tiny-vdom';

const el = createElement(h('div'));

patch(el, h('div', null, 'Hello World!'), h('div'));
```

## License

`tiny-vdom` is [MIT-licensed](LICENSE) open-source software by [Aiden Bai](https://github.com/aidenybai).
