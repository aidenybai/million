import { parse, print, visit } from 'recast';
import { PluginOption } from 'vite';
import { compile } from './compile';
import { jsxFactory } from './index';

export const plugin = (options?: any): PluginOption[] => [
  {
    name: 'vite:million-config',
    enforce: 'pre',
    config() {
      return {
        esbuild: {
          jsxFactory,
          jsxFragment: `${jsxFactory}_FRAGMENT`,
          jsxInject: `import { h as ${jsxFactory}, Fragment as ${jsxFactory}_FRAGMENT } from '${
            options.importSource || 'million/jsx-runtime'
          }';`,
        },
      };
    },
  },
  {
    name: 'vite:million-jsx',
    async transform(code, id) {
      if (id.includes('node_modules') || !/\.(jsx|tsx)$/.test(id)) return;

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

      return { code: print(ast).code };
    },
  },
];

export default plugin;
