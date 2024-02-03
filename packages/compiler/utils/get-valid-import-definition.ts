import * as t from '@babel/types';
import type { ImportDefinition, StateContext } from '../types';
import { unwrapNode } from './unwrap-node';

function isValidIdentifier(
  node: t.Node,
): node is t.Identifier | t.JSXIdentifier {
  return t.isIdentifier(node) || t.isJSXIdentifier(node);
}

function getValidImportDefinitionFromIdentifier(
  ctx: StateContext,
  path: babel.NodePath,
): ImportDefinition | undefined {
  const id = unwrapNode(path.node, isValidIdentifier);
  if (id) {
    const binding = path.scope.getBindingIdentifier(id.name) as
      | t.Identifier
      | undefined;
    // babel kinda fcked up
    if (binding) {
      return ctx.definitions.identifiers.get(binding);
    }
    return undefined;
  }
  return undefined;
}

function getValidImportDefinitionFromMemberExpression(
  ctx: StateContext,
  path: babel.NodePath,
): ImportDefinition | undefined {
  const member = unwrapNode(path.node, t.isMemberExpression);
  if (!(member && !member.computed && t.isIdentifier(member.property))) {
    return undefined;
  }
  const object = unwrapNode(member.object, t.isIdentifier);
  if (!object) {
    return undefined;
  }
  const binding = path.scope.getBindingIdentifier(object.name) as
    | t.Identifier
    | undefined;
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

function getValidImportDefinitionFromJSXMemberExpression(
  ctx: StateContext,
  path: babel.NodePath,
): ImportDefinition | undefined {
  if (!path.isJSXMemberExpression()) {
    return undefined;
  }
  const object = unwrapNode(path.node.object, t.isJSXIdentifier);
  if (!object) {
    return undefined;
  }
  const binding = path.scope.getBindingIdentifier(object.name) as
    | t.Identifier
    | undefined;
  if (!binding) {
    return undefined;
  }
  const defs = ctx.definitions.namespaces.get(binding);
  if (!defs) {
    return undefined;
  }
  const propName = path.node.property.name;
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

export function getValidImportDefinition(
  ctx: StateContext,
  path: babel.NodePath,
): ImportDefinition | undefined {
  return (
    getValidImportDefinitionFromIdentifier(ctx, path) ||
    getValidImportDefinitionFromMemberExpression(ctx, path) ||
    getValidImportDefinitionFromJSXMemberExpression(ctx, path)
  );
}
