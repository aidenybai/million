import { parse, print, visit } from 'recast';
import { compile } from './compile';

const JSX_FILTER = /\.(jsx|tsx)$/;
const jsxFactory = '__MILLION_JSX';
const jsxFragment = '__MILLION_JSX_FRAGMENT';

export const million = (options?: { importSource: string; react: boolean }): any[] => [
  {
    name: 'vite:million-config',
    enforce: 'pre',
    config() {
      const resolve =
        options?.react === undefined || options?.react === true
          ? {
              alias: {
                react: 'million/react',
                'react-dom': 'million/react',
              },
            }
          : {};
      return {
        esbuild: {
          jsxFactory,
          jsxFragment,
          jsxInject: `import { h as ${jsxFactory}, Fragment as ${jsxFragment} } from '${
            options?.importSource || 'million/jsx-runtime'
          }';`,
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

      if (!code.includes(`${jsxFragment}(`)) {
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
