just a virtual dom for now

usage:

```js
import { h, patch } from 'million';

const myButtonComponent = (count: number) => {
  patch(
    h('button', { id: 'millapp', onclick: () => myButtonComponent(count + 1) }, [String(count)]),
    document.querySelector('#millapp'),
  );
};

myButtonComponent(0);
```

Todo:
- hooks
- jsx?
- svg (ns)
- xml
