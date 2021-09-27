export const adjectives = [
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
export const colors = [
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
export const nouns = [
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

export const random = (max: number): number => {
  return Math.round(Math.random() * 1000) % max;
};

interface Data {
  id: number;
  label: string;
}

let id = 0;

export const buildData = (count: number): Data[] => {
  const data: Data[] = [];
  for (let i = 0; i < count; ++i) {
    data.push({
      id: id++,
      label: `${adjectives[random(adjectives.length)]} ${colors[random(colors.length)]} ${
        nouns[random(nouns.length)]
      }`,
    });
  }
  return data;
};
