just a virtual dom for now

usage:

```js
import { m, patch } from 'million';

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const Button = (color: string) => {
  return m('button', { onclick: () => render(getRandomColor()), style: { color } }, [
    String(color),
  ]);
};

const render = (color: string = getRandomColor()) => {
  patch(
    m('div', { id: 'app', style: { 'background-color': color } }, [Button(color)]),
    document.querySelector('#app'),
  );
};

render();
```

Todo:

- hooks
- jsx?
- svg (ns)
- xml
