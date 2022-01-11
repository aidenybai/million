import { node, children, DOMNode, VNode, DOMOperation } from 'million';

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

const random = (max: number) => {
  return Math.round(Math.random() * 1000) % max;
};

let id = 0;

export const buildData = (count: number) => {
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

export const diff = node([children()]);

export const patch = (
  el: DOMNode,
  newVNode: VNode,
  oldVNode?: VNode,
  effects: DOMOperation[] = [],
) => {
  const data = diff(el, newVNode, oldVNode, effects);
  for (let i = 0; i < effects.length; i++) {
    effects[i]();
  }
  return data.el;
};
