import * as t from '@babel/types';
import { dim, green, underline, yellow } from 'kleur/colors';
import {
  addNamedCache,
  handleVisitorError,
  hasStyledAttributes,
  isComponent,
  resolvePath,
  styleSecondaryMessage,
} from './utils';
import { callExpressionVisitor } from './call-expression-visitor';
import { catchError } from './utils/log';
import { addImport } from './utils/mod';
import type { Info } from '../visit';
import type { NodePath } from '@babel/core';
import type { Options } from '../plugin';

// TODO: for rsc, need to find children files without 'use client' but are client components
// https://nextjs.org/docs/app/building-your-application/rendering/client-components#using-client-components-in-nextjs
//
// TODO: add support for <For> for .maps
export const autoscan = (
  options: Options,
  path: NodePath<t.FunctionDeclaration | t.VariableDeclarator>,
  dirname: string,
  info: Info,
) => {
  if (!options.auto) return;

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
  if (typeof options.auto === 'object' && options.auto.rsc) {
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
    (path) => path.parentPath?.isProgram() || path.isProgram(),
  )!;
  const comment =
    rawComponent.leadingComments?.[0] ||
    path.parent.leadingComments?.[0] ||
    globalPath.node.leadingComments?.[0];

  if (comment?.value.includes('million-ignore')) {
    // eslint-disable-next-line no-console
    console.log(dim(` ○ ${yellow(`<${rawComponent.id.name}>`)} was ignored`));
    return;
  }

  const blockStatementPath = resolvePath(componentPath.get('body'));
  const returnStatementPath = blockStatementPath
    .get('body')
    .find((path) => path.isReturnStatement());

  if (!returnStatementPath?.has('argument')) return;
  const argumentPath = resolvePath(returnStatementPath.get('argument'));

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

  if (typeof options.auto === 'object' && options.auto.skip) {
    skipIds.push(...options.auto.skip);
  }

  blockStatementPath.traverse({
    Identifier(path) {
      if (
        skipIds.some((id) =>
          typeof id === 'string'
            ? path.node.name === id
            : id.test(path.node.name),
        )
      ) {
        componentInfo.bailout = true;
        return path.stop();
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
          return path.stop();
        }

        if (isSpecialElement) {
          componentInfo.components++;
          return path.skip();
        }
      }
      if (t.isJSXIdentifier(type) && isComponent(type.name)) {
        componentInfo.components++;
        return path.skip();
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
        return path.skip();
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
      if (hasStyledAttributes(attribute) || attribute.name.name === 'ref') {
        componentInfo.components++;
        return path.skip();
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
        return path.stop();
      }
    },
  });

  const good =
    componentInfo.elements + componentInfo.attributes + componentInfo.text;
  const bad = componentInfo.components + componentInfo.expressions;
  const improvement = (good - bad) / (good + bad);

  const threshold =
    typeof options.auto === 'object' && options.auto.threshold
      ? options.auto.threshold
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

  if (!options.mute || options.mute === 'info') {
    // eslint-disable-next-line no-console
    console.log(
      styleSecondaryMessage(
        `${yellow(`<${rawComponent.id.name}>`)} now renders ${green(
          underline(`~${improvementFormatted}%`),
        )} faster`,
        ' ⚡ ',
      ),
    );
  }

  const block = info.programPath.scope.hasBinding('block')
    ? t.identifier('block')
    : addImport(
        'block',
        options.server ? 'million/react-server' : 'million/react',
        path,
        info.programPath,
      );

  const rewrittenComponentNode = t.variableDeclaration('const', [
    t.variableDeclarator(
      rawComponent.id,
      t.callExpression(block, [
        t.isFunctionDeclaration(componentPath.node)
          ? t.functionExpression(
              rawComponent.id,
              componentPath.node.params,
              componentPath.node.body,
            )
          : componentPath.node,
      ]),
    ),
  ]);

  let rewrittenVariableDeclarationPath: NodePath<t.VariableDeclaration>;

  if (rawComponentParentPath.isExportNamedDeclaration()) {
    rawComponentParentPath.replaceWith(
      t.exportNamedDeclaration(null, [
        t.exportSpecifier(rawComponent.id, rawComponent.id),
      ]),
    );
    rewrittenVariableDeclarationPath = rawComponentParentPath.insertBefore(
      rewrittenComponentNode,
    )[0];
  } else if (rawComponentParentPath.isExportDefaultDeclaration()) {
    path.replaceWith(rawComponent.id);
    rewrittenVariableDeclarationPath = rawComponentParentPath.insertBefore(
      rewrittenComponentNode,
    )[0];
  } else if (path.isVariableDeclarator()) {
    rewrittenVariableDeclarationPath = rawComponentParentPath.replaceWith(
      rewrittenComponentNode,
    )[0];
  } else {
    rewrittenVariableDeclarationPath = path.replaceWith(
      rewrittenComponentNode,
    )[0];
  }

  const rewrittenComponentPath = resolvePath(
    rewrittenVariableDeclarationPath,
  ).get('declarations.0.init') as NodePath<t.CallExpression>;

  rewrittenComponentPath.scope.crawl();
  const visitor = callExpressionVisitor(
    { mute: 'info', ...options },
    isReact,
    false,
    true,
  );
  catchError(() => visitor(rewrittenComponentPath, new Map(), dirname), 'info');
};
