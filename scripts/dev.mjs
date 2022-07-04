import { $ } from 'zx';
import { write, exists } from 'fsxx';
import { info } from './helpers.mjs';

const index_html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><link rel="stylesheet" href="./style.css"><script type="module" src="./script.tsx"></script></head><body><div id="root"></div></body></html>`;
const script_tsx = `
import { createRoot, useState } from 'src/react';

function App() {
  const [count, setCount] = useState(0);

  const H1 = <h1>welcome to your million App</h1>


  return <>
    <div style="text-align: center;">
      <img src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/icon.svg" />
    </div>
    {H1}
    <div  style="text-align: center;">
      <div>{count} </div>
      <button onClick={() => setCount(count + 1)}>click</button>
    </div>
  </>
}

createRoot(document.getElementById('root')).render(<App />);
`;
const style_css = `body { font-size: 2em; display: flex; justify-content: center; align-items: start; padding-top: 2em; font-family: Arial; }`;

if (!(await exists('dev'))) {
  await $`mkdir dev`;
  await write('./dev/index.html', index_html);
  await write('./dev/script.tsx', script_tsx);
  await write('./dev/style.css', style_css);
  info("Couldn't find an the `dev` directory, creating one for you...\n");
}
