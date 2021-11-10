import { Driver, flush } from '../src/index';

const adjectives = [
  'pretty',
  'large',
  'big',
  'small',
  'tall',
  'short',
  'long',
  'handsome',
  'plain',
  'quaint',
  'clean',
  'elegant',
  'easy',
  'angry',
  'crazy',
  'helpful',
  'mushy',
  'odd',
  'unsightly',
  'adorable',
  'important',
  'inexpensive',
  'cheap',
  'expensive',
  'fancy',
];
const colors = [
  'red',
  'yellow',
  'blue',
  'green',
  'pink',
  'brown',
  'purple',
  'brown',
  'white',
  'black',
  'orange',
];
const nouns = [
  'table',
  'chair',
  'house',
  'bbq',
  'desk',
  'car',
  'pony',
  'cookie',
  'sandwich',
  'burger',
  'pizza',
  'mouse',
  'keyboard',
];

const random = (max) => {
  return Math.round(Math.random() * 1000) % max;
};

let id = 0;

export const buildData = (count) => {
  const data = new Array(count).fill(0);
  for (let i = 0; i < count; ++i) {
    data[i] = {
      id: id++,
      label: `${adjectives[random(adjectives.length)]} ${colors[random(colors.length)]} ${
        nouns[random(nouns.length)]
      }`,
    };
  }
  return data;
};

export const patch = (el, newVNode, oldVNode, workStack = []) => {
  const diff = Driver.Node([Driver.Children()]);
  const data = diff(el, newVNode, oldVNode, workStack);
  flush(data.workStack);
  return data.el;
};
