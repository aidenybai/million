import { h, JSXVNode } from '../jsx-runtime';
import { types, parse, visit, print } from 'recast';
import { PluginOption } from 'vite';

const { literal, property, objectExpression, arrayExpression } = types.builders;
export const jsxFactory = '__MILLION_JSX';

export const fromASTNodeToVNode = (value: any) => {
  const args = value.arguments;
  const astProps = value.arguments[1];
  const astChildren = args.slice(2);
  const vnodeChildren: JSXVNode[] = [];
  const vnodeProps = {};

  for (let i = 0; i < astProps.properties?.length; i++) {
    const astProp = astProps.properties[i];
    if (astProp.value.type === 'ObjectExpression') {
      const vnodeObject = {};
      const astObject = astProp.value.properties;
      for (let j = 0; j < astObject.length; j++) {
        vnodeObject[astObject[j].key.name] = astObject[j].value.value;
      }
      vnodeProps[astProp.key.name] = vnodeObject;
    } else if (astProp.value.type.includes('Function')) {
      vnodeProps[astProp.key.name] = () => astProp;
    } else if (astProp.value.type === 'Literal') {
      vnodeProps[astProp.key.name] = astProp.value.value;
    } else {
      return value;
    }
  }

  for (const child of astChildren) {
    if (child.type === 'CallExpression') {
      if (child.callee.name === jsxFactory) vnodeChildren.push(fromASTNodeToVNode(child));
      else return value;
    } else if (
      child.type === 'Literal' &&
      child.value !== undefined &&
      child.value !== null &&
      child.value !== false
    ) {
      vnodeChildren.push(String(child.value));
    } else {
      return value;
    }
  }

  return h(value.arguments[0].value, vnodeProps, ...vnodeChildren);
};

export const fromVNodeToASTNode = (vnode: any) => {
  if (vnode.value || vnode.type) return vnode;
  const astProps = objectExpression(
    Object.entries(vnode.props)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([name, value]) => {
        return typeof value === 'function'
          ? value()
          : property('init', literal(name), literal(value as string | number | boolean));
      }),
  );

  const astChildren = arrayExpression(
    vnode.children.map((child: any) => {
      if (typeof child === 'string') {
        return literal(child);
      } else {
        return fromVNodeToASTNode(child);
      }
    }),
  );

  const astVNode = [
    property('init', literal('tag'), literal(vnode.tag)),
    property('init', literal('flag'), literal(vnode.flag)),
  ];
  if (vnode.props && Object.keys(vnode.props).length > 0) {
    astVNode.push(property('init', literal('props'), astProps));
  }
  if (vnode.children && vnode.children.length > 0) {
    astVNode.push(property('init', literal('children'), astChildren));
  }
  if (vnode.key) {
    astVNode.push(property('init', literal('key'), literal(String(vnode.key))));
  }
  return objectExpression(astVNode);
};

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
      const callExpressionPaths: any[] = [];

      visit(ast, {
        visitCallExpression(path) {
          if (path.value.callee.name === jsxFactory) {
            callExpressionPaths.push(path);
          }
          this.traverse(path);
        },
      });

      for (const path of callExpressionPaths) {
        path.replace(fromVNodeToASTNode(fromASTNodeToVNode(path.value)));
      }

      return { code: print(ast).code };
    },
  },
];

export default plugin;
