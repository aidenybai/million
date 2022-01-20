import { $ } from 'zx';
import { write, exists } from 'fsxx';
import { info } from './helpers.mjs';

const index_html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><link rel="stylesheet" href="./style.css"><script type="module" src="./script.tsx"></script></head><body></body></html>`;
const script_tsx = `import { m, createElement, patch } from 'million';

const view = (seconds) => m('p', undefined, [\`Time elapsed: \$\{seconds\}\`]);

const el = createElement(view(0));

let seconds = 0;

setInterval(() => {
  patch(el, view(seconds));
  seconds++;
}, 1000);

document.body.appendChild(el);`;
const style_css = `body { font-size: 2em; display: flex; justify-content: center; align-items: start; padding-top: 2em; font-family: Arial; }`;

if (!(await exists('dev'))) {
  await $`mkdir dev`;
  await write('./dev/index.html', index_html);
  await write('./dev/script.tsx', script_tsx);
  await write('./dev/style.css', style_css);
  info("Couldn't find an the `dev` directory, creating one for you...\n");
}

await $`vite`;
