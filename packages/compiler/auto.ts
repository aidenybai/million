import * as t from '@babel/types';
import type { NodePath } from '@babel/core';
import { catchError, logIgnore, logImprovement } from './utils/log';
import { addImport } from './utils/mod';
import type { Info } from './babel';
import { isAttributeUnsupported, isComponent } from './utils/jsx';
import { transformBlock } from './block';

// TODO: for rsc, need to find children files without 'use client' but are client components
// https://nextjs.org/docs/app/building-your-application/rendering/client-components#using-client-components-in-nextjs
//
// TODO: add support for <For> for .maps
export const parseAuto = (
  path: NodePath<t.FunctionDeclaration | t.VariableDeclarator>,
  info: Info
): void => {
  if (!info.options.auto) return;

  const rawComponent = path.node;

  const isInProgramScope =
    t.isIdentifier(rawComponent.id) &&
    info.programPath.scope.hasOwnBinding(rawComponent.id.name);

  if (!isInProgramScope) return;

  if (
    t.isCallExpression(path.parent) &&
    t.isIdentifier(path.parent.callee, { name: 'block' }) // probably need a import level check later
  )
    return;

  let componentPath: NodePath<
    t.FunctionDeclaration | t.FunctionExpression | t.ArrowFunctionExpression
  >;

  // Next.js React Server Components support
  if (typeof info.options.auto === 'object' && info.options.auto.rsc) {
    const directives = info.programPath.node.directives;
    if (!directives.length) return; // we assume it's server component only
    const hasUseClientDirective = directives.some((directive) => {
      return directive.value.value === 'use client';
    });
    if (!hasUseClientDirective) return;
  }

  if (t.isVariableDeclarator(rawComponent)) {
    if (
      !t.isArrowFunctionExpression(rawComponent.init) &&
      !t.isFunctionExpression(rawComponent.init)
    ) {
      return;
    }
    // it's possible that the component is a block
    // probably need a import level check later)
    if (
      t.isCallExpression(rawComponent.init) &&
      t.isIdentifier(rawComponent.init, { name: 'block' })
    )
      return;
    if (rawComponent.init.async) return; // RSC / Loader

    componentPath = path.get('init') as NodePath<
      t.FunctionExpression | t.ArrowFunctionExpression
    >;
  } else {
    componentPath = path as NodePath<t.FunctionDeclaration>;
  }

  if (!t.isIdentifier(rawComponent.id)) return;
  if (!isComponent(rawComponent.id.name)) return;

  const globalPath = path.findParent(
    (path) => path.parentPath?.isProgram() || path.isProgram()
  )!;
  const comment =
    rawComponent.leadingComments?.[0] ||
    path.parent.leadingComments?.[0] ||
    globalPath.node.leadingComments?.[0];

  if (comment?.value.includes('million-ignore')) {
    logIgnore(rawComponent.id.name);
    return;
  }

  const blockStatementPath = componentPath.get(
    'body'
  ) as NodePath<t.BlockStatement>;
  const returnStatementPath = blockStatementPath
    .get('body')
    .find((path) => path.isReturnStatement());

  if (!returnStatementPath?.has('argument')) return;
  const argumentPath = returnStatementPath.get('argument') as NodePath<
    t.JSXElement | t.JSXFragment
  >;

  if (!argumentPath.isJSXElement() && !argumentPath.isJSXFragment()) {
    return;
  }

  const componentInfo = {
    bailout: false,
    elements: 0,
    attributes: 0,
    components: 0,
    text: 0,
    expressions: 0,
    depth: 0,
    returns: 0,
  };

  const skipIds: (string | RegExp)[] = [];

  if (typeof info.options.auto === 'object' && info.options.auto.skip) {
    skipIds.push(...info.options.auto.skip);
  }

  blockStatementPath.traverse({
    Identifier(path) {
      if (
        skipIds.some((id) =>
          typeof id === 'string'
            ? path.node.name === id
            : id.test(path.node.name)
        )
      ) {
        componentInfo.bailout = true;
        path.stop();

      }
    },
    JSXElement(path) {
      const type = path.node.openingElement.name;
      if (t.isJSXMemberExpression(type)) {
        const isContext =
          t.isJSXIdentifier(type.object) &&
          isComponent(type.property.name) &&
          type.property.name === 'Provider';
        const isSpecialElement = t.isJSXIdentifier(type.object);

        if (isContext) {
          componentInfo.bailout = true;
          path.stop();
          return;
        }

        if (isSpecialElement) {
          componentInfo.components++;
          path.skip();
          return;
        }
      }
      if (t.isJSXIdentifier(type) && isComponent(type.name)) {
        componentInfo.components++;
        path.skip();
        return;
      }

      componentInfo.elements++;
    },
    JSXSpreadChild(path) {
      componentInfo.components++;
      path.skip();
    },
    JSXExpressionContainer(path) {
      if (t.isJSXEmptyExpression(path.node.expression)) return;

      if (
        t.isCallExpression(path.node.expression) &&
        t.isMemberExpression(path.node.expression.callee) &&
        t.isIdentifier(path.node.expression.callee.property, { name: 'map' })
      ) {
        return;
      }

      if (t.isConditionalExpression(path.node.expression)) {
        componentInfo.components++;
        path.skip();
        return;
      }

      if (!t.isLiteral(path.node.expression)) componentInfo.expressions++;
      if (!t.isJSXAttribute(path.parent)) path.skip();
    },
    JSXSpreadAttribute(path) {
      componentInfo.components++;
      path.skip();
    },
    JSXAttribute(path) {
      const attribute = path.node;
      // twin.macro + styled-components / emotion support
      if (isAttributeUnsupported(attribute) || attribute.name.name === 'ref') {
        componentInfo.components++;
        path.skip();
        return;
      }
      if (!t.isLiteral(attribute.value)) componentInfo.attributes++;
    },
    JSXText(path) {
      if (path.node.value.trim() !== '') componentInfo.text++;
    },
    ReturnStatement(path) {
      if (path.scope !== returnStatementPath.scope) return;
      componentInfo.returns++;
      if (componentInfo.returns > 1) {
        componentInfo.bailout = true;
        path.stop();

      }
    },
  });

  const good =
    componentInfo.elements + componentInfo.attributes + componentInfo.text;
  const bad = componentInfo.components + componentInfo.expressions;
  const improvement = (good - bad) / (good + bad);

  const threshold =
    typeof info.options.auto === 'object' && info.options.auto.threshold
      ? info.options.auto.threshold
      : 0.1;

  if (
    isNaN(improvement) ||
    improvement <= threshold ||
    componentInfo.bailout ||
    good < 5
  ) {
    return;
  }

  const improvementFormatted = isFinite(improvement)
    ? (improvement * 100).toFixed(0)
    : '∞';

  if (!info.options.log || info.options.log === 'info') {
    logImprovement(rawComponent.id.name, improvementFormatted);
  }

  const block = info.programPath.scope.hasBinding('block')
    ? t.identifier('block')
    : addImport(path, 'block', info.imports.source!, info);

  const rewrittenComponentNode = t.variableDeclaration('const', [
    t.variableDeclarator(
      rawComponent.id,
      t.callExpression(block, [
        t.isFunctionDeclaration(componentPath.node)
          ? t.functionExpression(
              rawComponent.id,
              componentPath.node.params,
              componentPath.node.body
            )
          : componentPath.node,
      ])
    ),
  ]);

  let rewrittenVariableDeclarationPath: NodePath<t.VariableDeclaration>;

  if (path.parentPath.isExportNamedDeclaration()) {
    path.parentPath.replaceWith(
      t.exportNamedDeclaration(null, [
        t.exportSpecifier(rawComponent.id, rawComponent.id),
      ])
    );
    rewrittenVariableDeclarationPath = path.parentPath.insertBefore(
      rewrittenComponentNode
    )[0];
  } else if (path.parentPath.isExportDefaultDeclaration()) {
    path.replaceWith(rawComponent.id);
    rewrittenVariableDeclarationPath = path.parentPath.insertBefore(
      rewrittenComponentNode
    )[0];
  } else if (path.isVariableDeclarator()) {
    rewrittenVariableDeclarationPath = path.parentPath.replaceWith(
      rewrittenComponentNode
    )[0];
  } else {
    rewrittenVariableDeclarationPath = path.replaceWith(
      rewrittenComponentNode
    )[0];
  }

  const rewrittenComponentPath = rewrittenVariableDeclarationPath.get(
    'declarations.0.init'
  ) as NodePath<t.CallExpression>;

  rewrittenComponentPath.scope.crawl();

  const log = info.options.log;
  const blocks = info.blocks;
  if (log !== true) {
    info.options.log = 'info';
  }

  info.blocks = new Map();

  catchError(() => {
    transformBlock(rewrittenComponentPath, info, false);
  }, 'info');

  info.options.log = log;
  info.blocks = blocks;
};
