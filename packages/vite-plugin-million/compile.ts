import { types } from 'recast';
import { h } from '../jsx-runtime';
import { jsxFactory } from './constants';
import type {
  CallExpression,
  Expression,
  Identifier,
  Literal,
  ObjectExpression,
  Property,
} from './types';
import type { RawVNode } from '../jsx-runtime/types';
import type { VNode } from '../million';

const { literal, property, objectExpression, arrayExpression } = types.builders;

/*
 * Million's VNode compiling tries to keep the VNode factory in one place:
 * 1. Parse out AST nodes using recast and grab critical information (tag, props, children)
 * 2. Pass the information to the h() VNode factory in million/jsx-runtime.
 *      NOTE: Non recognized data types will be hard returned so that the VNode factory
 *            can handle it during runtime
 * 3. Reconstruct AST node from the VNode created by h()
 * 4. Replace the old AST node with the new AST node
 */
export const compile = (astNode: CallExpression) => {
  return fromVNodeToASTNode(fromASTNodeToVNode(astNode));
};

export const fromASTNodeToVNode = (
  astNode: CallExpression,
): RawVNode | CallExpression => {
  if (astNode.arguments[0]?.type !== 'Literal') {
    return astNode;
  }

  const args = astNode.arguments;
  const astProps = astNode.arguments[1] as ObjectExpression;
  const astChildren = args.slice(2);
  const vnodeChildren: RawVNode[] = [];
  const vnodeProps: any = {};

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  for (let i = 0; i < astProps.properties?.length; i++) {
    const astProp = astProps.properties[i] as Property;
    const astPropKey = astProp.key as Identifier;
    if (astProp.value.type === 'ObjectExpression') {
      const vnodeObject: any = {};
      const astObject = astProp.value.properties;
      for (let j = 0; j < astObject.length; j++) {
        const astObjectProp = astObject[j] as Property;
        vnodeObject[(astObjectProp.key as Identifier).name] = (
          astObjectProp.value as Literal
        ).value;
      }
      vnodeProps[astPropKey.name] = vnodeObject;
    } else if (astProp.value.type.includes('Function')) {
      vnodeProps[astPropKey.name] = () => astProp;
    } else if (astProp.value.type === 'Literal') {
      vnodeProps[astPropKey.name] = astProp.value.value;
    } else {
      return astNode;
    }
  }

  for (const child of astChildren) {
    if (child.type === 'CallExpression') {
      if ((child.callee as Identifier).name === jsxFactory) {
        vnodeChildren.push(fromASTNodeToVNode(child) as RawVNode);
      } else return astNode;
    } else if (
      child.type === 'Literal' &&
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      child.value !== undefined &&
      child.value !== null &&
      child.value !== false
    ) {
      vnodeChildren.push(String(child.value));
    } else {
      return astNode;
    }
  }

  return h(
    String(astNode.arguments[0].value),
    vnodeProps,
    ...vnodeChildren,
  ) as VNode;
};

export const fromVNodeToASTNode = (
  vnode: RawVNode | CallExpression,
): Expression => {
  if (
    (vnode as unknown as Literal).value ||
    (vnode as unknown as Expression).type
  )
    return vnode as Expression;
  if (typeof vnode === 'object') {
    const velement = vnode as Exclude<RawVNode, string | number | boolean>;
    const astProps = objectExpression(
      Object.entries(velement?.props || {})
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([name, value]) => {
          return typeof value === 'function'
            ? value()
            : property(
                'init',
                literal(name),
                literal(value as string | number | boolean),
              );
        }),
    );

    const astChildren = arrayExpression(
      (velement?.children || []).map(
        (child: RawVNode): Literal | CallExpression => {
          if (typeof child === 'string') {
            return literal(child);
          }
          return fromVNodeToASTNode(child) as Literal | CallExpression;
        },
      ),
    );

    const astVNode = [
      property('init', literal('tag'), literal(velement?.tag as string)),
      property('init', literal('flag'), literal(velement?.flag as number)),
    ];
    if (velement?.props && Object.keys(velement.props).length > 0) {
      astVNode.push(property('init', literal('props'), astProps));
    }
    if (velement?.children && velement.children.length > 0) {
      astVNode.push(property('init', literal('children'), astChildren));
    }
    if (velement?.key) {
      astVNode.push(
        property('init', literal('key'), literal(String(velement.key))),
      );
    }
    return objectExpression(astVNode);
  }
  return literal(vnode ?? null);
};
