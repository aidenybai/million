#!/usr/bin/env zx
import 'zx/globals';
$.verbose = false;

// NOTE: This is a hack because some of the functions and types are shared between jsx and index, and we want to import index into jsx instead of duplicates.

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

const collapseSharedFunctions = (content, esm = true) => {
  /*
    // Various shared functions that need to be collapsed into an import statement...
    const h = // should be kept
    // Actual functions that are unique and should be kept
  */
  const delimiter = 'const h';
  const [, functions] = content.split(delimiter);
  return `${
    esm
      ? `import { className, kebab, m, style, svg, VFlags } from './million';`
      : `const { className, kebab, m, style, svg, VFlags } = require('./million.cjs');`
  }
  ${delimiter}${functions}`;
};

// d.ts
glob('dist/jsx-runtime.*d.ts', {}, async (err, files) => {
  if (err) throw new Error(err);
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    await writeFile(file, collapseSharedTypes(text));
  }
});

// esm
for (const file of ['dist/jsx-runtime.js', 'dist/jsx-runtime.esm.js']) {
  const text = await readFile(file, 'utf8');
  await writeFile(file, collapseSharedFunctions(text));
}

// cjs
const text = await readFile('dist/jsx-runtime.cjs.js', 'utf8');
await writeFile('dist/jsx-runtime.cjs.js', collapseSharedFunctions(text, false));
