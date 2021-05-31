just a virtual dom for now

usage:

```js
// <div id="app"></div>

import { h, patch } from 'million';

const myButtonComponent = (count: number) => {
  patch(
    h('button', { id: 'app', onclick: () => myButtonComponent(count + 1) }, [String(count)]),
    document.querySelector('#app'),
  );
};

myButtonComponent(0);
```

Todo:
- hooks
- jsx?
- svg (ns)
- xml
