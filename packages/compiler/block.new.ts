import * as t from '@babel/types';
import type { StateContext } from "./types";
import { unwrapNode } from "./utils/unwrap-node";
import { SKIP_ANNOTATION } from './constants';
import { findComment } from './utils/ast';
import { isComponent } from './utils/checks';
import { unwrapPath } from './utils/unwrap-path';
import { getImportIdentifier } from './utils/get-import-specifier';
import { IMPORTS } from './constants.new';

function isValidBlockCall(ctx: StateContext, path: babel.NodePath<t.CallExpression>): boolean {
  // Check for direct identifier usage e.g. import { block }
  const identifier = unwrapNode(path.node.callee, t.isIdentifier);
  if (identifier) {
    const binding = path.scope.getBindingIdentifier(identifier.name);
    const definition = ctx.definitions.identifiers.get(binding);
    if (definition) {
      return IMPORTS.block[ctx.mode] === definition;
    }
    return false;
  }
  // Check for namespace usage e.g. import * as million
  const memberExpr = unwrapNode(path.node.callee, t.isMemberExpression);
  if (memberExpr && !memberExpr.computed && t.isIdentifier(memberExpr.property)) {
    const object = unwrapNode(memberExpr.object, t.isIdentifier);
    if (object) {
      const binding = path.scope.getBindingIdentifier(object.name);
      const propName = memberExpr.property.name;
      const definitions = ctx.definitions.namespaces.get(binding);
      if (definitions) {
        for (let i = 0, len = definitions.length; i < len; i++) {
          const definition = definitions[i]!;
          if (definition.kind === 'named' && definition.name === propName) {
            return IMPORTS.block[ctx.mode] === definition;
          }
        }
      }
    }
  } 
  return false;
}

// function transformJSX(ctx: StateContext, path: babel.NodePath<t.JSXElement>): void {
  
// }

export function transformBlock(ctx: StateContext, path: babel.NodePath<t.CallExpression>): void {
  // Check first if the call is a valid `block` call
  if (!isValidBlockCall(ctx, path)) {
    return;
  }
  // Check if we should skip because the compiler
  // can also output a `block` call. Without this,
  // compiler will suffer a recursion.
  if (findComment(path.node, SKIP_ANNOTATION)) {
    return;
  }
  const args = path.get('arguments');
  // Make sure that we have at least one argument,
  // and that argument is a component.
  if (args.length <= 0) {
    return;
  }
  const identifier = unwrapPath(args[0]!, t.isIdentifier);
  // Handle identifiers differently
  if (identifier) {
    return;
  }
  const component = unwrapPath(args[0]!, isComponent);
  if (!component) {
    return;
  }
  const callee = getImportIdentifier(ctx, path, IMPORTS.block[ctx.mode]);
  // Transform all top-level JSX (aka the JSX owned by the component)
  // component.traverse({
  //   JSXElement(childPath) {
  //     const functionParent = childPath.getFunctionParent();
  //     if (functionParent === component) {
  //       transformJSX(ctx, childPath);
  //     }
  //   },
  //   JSXFragment(childPath) {
  //     const functionParent = childPath.getFunctionParent();
  //     if (functionParent === component) {
        
  //     }
  //   },
  // });
}