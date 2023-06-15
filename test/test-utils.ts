import { transformSync } from '@babel/core';
import { babelPlugin } from '../packages/compiler/plugin';
import type { BabelFileResult } from '@babel/core';

export function babelTransform(code: string) {
  const filename = 'test.tsx';

  const result: BabelFileResult | null = transformSync(code, {
    presets: ['@babel/preset-typescript', ['@babel/preset-react']],
    plugins: [babelPlugin],
    filename,
  });

  if (result === null || !result.code) throw new Error(`Transform failed`);

  return result;
}
