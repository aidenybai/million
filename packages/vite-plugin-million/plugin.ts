import { transformAsync } from '@babel/core';
import { parse, print, visit } from 'recast';
import { compile } from './compile';
import { jsxFactory } from './index';

const JSX_FILTER = /\.(jsx|tsx)$/;

export const million = (options?: { importSource: string }): any[] => [
  {
    name: 'vite:million-config',
    enforce: 'pre',
    config() {
      return {
        esbuild: {
          jsxFactory,
          jsxFragment: `${jsxFactory}_FRAGMENT`,
          jsxInject: `import { h as ${jsxFactory}, Fragment as ${jsxFactory}_FRAGMENT } from '${
            options?.importSource || 'million/jsx-runtime'
          }';`,
        },
      };
    },
  },
  {
    name: 'vite:million-jsx-static-hoist',
    enforce: 'pre',
    async transform(code: string, id: string) {
      if (id.includes('node_modules') || !JSX_FILTER.test(id)) return;
      const result = await transformAsync(code, {
        filename: id,
        presets: ['@babel/preset-typescript'],
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'classic', pragma: jsxFactory }],
          '@babel/plugin-transform-react-constant-elements',
        ],
      });
      return { code: result?.code, map: result?.map };
    },
  },
  {
    name: 'vite:million-static-vnode',
    async transform(code: string, id: string) {
      if (id.includes('node_modules') || !JSX_FILTER.test(id)) return;

      const ast = parse(code);
      const astNodes: any[] = [];

      visit(ast, {
        visitCallExpression(path) {
          if (path.value.callee.name === jsxFactory) {
            astNodes.push(path);
          }
          this.traverse(path);
        },
      });

      for (let i = 0; i < astNodes.length; i++) {
        astNodes[i].replace(compile(astNodes[i].value));
      }

      const result = print(ast);

      return { code: result.code, map: result.map };
    },
  },
];
