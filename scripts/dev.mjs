#!/usr/bin/env zx
import 'zx/globals';
import { info } from './helpers.mjs';

const index_html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Million Playground</title><link rel="stylesheet" href="./style.css"><script type="module" src="./script.tsx"></script></head><body></body></html>`;
const script_tsx = `import { m, createElement, patch } from 'million';

const app = createElement(m('div', { id: 'app' }, ['Hello World']));
document.body.appendChild(app);

setTimeout(() => {
  patch(app, m('div', { id: 'app' }, ['Goodbye World']));
}, 1000);`;
const style_css = `body { font-size: 2em; display: flex; justify-content: center; align-items: start; padding-top: 2em; font-family: Arial; }`;

if (!fs.existsSync('dev')) {
  await $`mkdir dev`;
  await fs.writeFile('./dev/index.html', index_html);
  await fs.writeFile('./dev/script.tsx', script_tsx);
  await fs.writeFile('./dev/style.css', style_css);
  info("Couldn't find an the `dev` directory, creating one for you...\n");
}

await $`vite`;
