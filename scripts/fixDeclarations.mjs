import glob from 'glob';
import { readFileSync, writeFileSync } from 'fs';

const replaceDupeTypes = (text) => {
  const delim = 'type JSXVNode';
  const [, types] = text.split(delim);
  return `import { VDelta, VElement, VNode, VProps } from './million';
  ${delim}${types}`;
};

glob('dist/jsx-runtime.*', {}, (err, files) => {
  if (err) console.error(err);
  files.forEach((file) => {
    const text = readFileSync(file, 'utf8');
    writeFileSync(file, replaceDupeTypes(text));
  });
});
