import { types } from 'recast';
import { h, JSXVNode } from '../jsx-runtime';
import { jsxFactory } from './index';

const { literal, property, objectExpression, arrayExpression } = types.builders;

/*
 * Million's VNode compiling tries to keep the VNode factory in one place:
 * 1. Parse out AST nodes using recast and grab critical information (tag, props, children)
 * 2. Pass the information to the h() VNode factory in million/jsx-runtime
 * 3. Reconstruct AST node from the VNode created by h()
 * 4. Replace path
 */
export const compile = (astNode: any) => {
  return fromVNodeToASTNode(fromASTNodeToVNode(astNode));
};

export const fromASTNodeToVNode = (astNode: any) => {
  const args = astNode.arguments;
  const astProps = astNode.arguments[1];
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
      return astNode;
    }
  }

  for (const child of astChildren) {
    if (child.type === 'CallExpression') {
      if (child.callee.name === jsxFactory) vnodeChildren.push(fromASTNodeToVNode(child));
      else return astNode;
    } else if (
      child.type === 'Literal' &&
      child.value !== undefined &&
      child.value !== null &&
      child.value !== false
    ) {
      vnodeChildren.push(String(child.value));
    } else {
      return astNode;
    }
  }

  return h(astNode.arguments[0].value, vnodeProps, ...vnodeChildren);
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
