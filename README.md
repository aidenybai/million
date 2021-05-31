just a virtual dom for now

usage:

```js
patch(newVNode, HTMLElement);
patch(h('div', { id: 'app' }, ['yo']), document.querySelector('#app'));
```



Todo:
- class, style handling
- synthetic events
- hooks
- components
- jsx?
- svg (ns)
- xml
