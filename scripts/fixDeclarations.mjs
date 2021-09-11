import glob from 'glob';
import { readFile, writeFile } from 'fs/promises';

const collapseSharedTypes = (content) => {
  /*
    // Various shared types that need to be collapsed into an import statement...
    type JSXVNode = // should be kept
    // Actual types that are unique and should be kept
  */
  const delimiter = 'type JSXVNode';
  const [, types] = content.split(delimiter);
  return `import { VDelta, VElement, VNode, VProps } from './million';
  ${delimiter}${types}`;
};

glob('dist/jsx-runtime.*', {}, async (err, files) => {
  if (err) throw new Error(err);
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    await writeFile(file, collapseSharedTypes(text));
  }
});
