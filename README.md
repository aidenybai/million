just a virtual dom for now

usage:

```js
import { h, patch } from 'million';

const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const Button = (color: string) => {
  return h('button', { onclick: () => App(getRandomColor()), style: { color } }, [String(color)])
}

const App = (color: string = getRandomColor()) => {
  patch(h('div', { id: 'app', style: { 'background-color': color } }, [Button(color)]), document.querySelector('#app'));
}

App();
```

Todo:
- hooks
- jsx?
- svg (ns)
- xml
