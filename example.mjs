import { transformAsync } from '@babel/core';
import { babel } from 'million/compiler';

async function compile(code) {
  const result = await transformAsync(code, {
    plugins: [
      [babel, { server: true }],
    ],
    parserOpts: {
      plugins: [
        'jsx',
      ],
    },
  });

  return result?.code ?? '';
}

console.log(await compile(`
import { block } from 'million/react';

export const Example = block(() => <h1>Hello World</h1>);
`));