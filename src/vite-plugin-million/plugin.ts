import { parse, print, visit } from 'recast';
import { compile } from './compile';
import { jsxCompat, jsxFactory, jsxFactoryRaw, jsxFragment, JSX_FILTER } from './constants';
import dedent from './dedent';

export const million = (options?: { importSource?: string; react?: boolean }): any[] => [
  {
    name: 'vite:million-config',
    enforce: 'pre',
    config() {
      const importSource = options?.importSource ?? 'million';
      const isReact = options?.react === true;
      const alias = `${importSource}/react`;
      const resolve = isReact
        ? {
            alias: {
              react: alias,
              'react-dom/client': alias,
              'react-dom/server': alias,
              'react-dom': alias,
            },
          }
        : {};

      return {
        esbuild: {
          jsxFactory,
          jsxFragment,
          jsxInject: isReact
            ? dedent`
                import { h as ${jsxFactoryRaw}, Fragment as ${jsxFragment} } from '${importSource}/jsx-runtime';
                import { compat as ${jsxCompat} } from '${importSource}/react';
                const ${jsxFactory} = ${jsxCompat}(${jsxFactoryRaw});\n
              `
            : dedent`
                import { h as ${jsxFactory}, Fragment as ${jsxFragment} } from '${importSource}/jsx-runtime';\n
              `,
        },
        resolve,
      };
    },
  },
  {
    name: 'vite:million-static-vnode',
    async transform(code: string, id: string) {
      if (id.includes('node_modules') || !JSX_FILTER.test(id)) return;

      const ast = parse(code);
      const astNodes: any[] = [];

      if (!code.includes(`${jsxFactory}(`)) {
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
      }

      const result = print(ast);

      return { code: result.code, map: result.map };
    },
  },
];
