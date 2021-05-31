just a virtual dom for now

usage:

```js
patch(newVNode, HTMLElement);
patch(h('div', { id: 'app' }, ['yo']), document.querySelector('#app'));
```
