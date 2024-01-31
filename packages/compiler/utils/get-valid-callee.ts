import * as t from '@babel/types';
import { ImportDefinition, StateContext } from "../types";
import { unwrapNode } from './unwrap-node';

function getValidCalleeFromIdentifier(
  ctx: StateContext,
  path: babel.NodePath<t.CallExpression>,
): ImportDefinition | undefined {
  const id = unwrapNode(path.node.callee, t.isIdentifier);
  if (id) {
    const binding = path.scope.getBindingIdentifier(id.name);
    // babel kinda fcked up
    if (binding) {
      return ctx.definitions.identifiers.get(binding);
    }
    return undefined;
  }
  return undefined;
}

function getValidCalleeFromMemberExpression(
  ctx: StateContext,
  path: babel.NodePath<t.CallExpression>,
): ImportDefinition | undefined {
  const member = unwrapNode(path.node.callee, t.isMemberExpression);
  if (!(member && !member.computed && t.isIdentifier(member.property))) {
    return undefined;
  }
  const object = unwrapNode(member.object, t.isIdentifier);
  if (!object) {
    return undefined;
  }
  const binding = path.scope.getBindingIdentifier(object.name);
  if (!binding) {
    return undefined;
  }
  const defs = ctx.definitions.namespaces.get(binding);
  if (!defs) {
    return undefined;
  }
  const propName = member.property.name;
  for (let i = 0, len = defs.length; i < len; i++) {
    const def = defs[i]!;
    if (def.kind === 'named' && def.name === propName) {
      return def;
    }
    if (def.kind === 'default' && propName === 'default') {
      return def;
    }
  }
  return undefined;
}

export function getValidCallee(
  ctx: StateContext,
  path: babel.NodePath<t.CallExpression>,
): ImportDefinition | undefined {
  return (
    getValidCalleeFromIdentifier(ctx, path) ||
    getValidCalleeFromMemberExpression(ctx, path)
  );
}