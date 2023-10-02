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
import type { NodePath } from '@babel/core';
import type { Options } from '../plugin';

export const componentVisitor = (options: Options = {}, isReact = true) => {
  return (
    rawComponentPath: NodePath<t.FunctionDeclaration | t.VariableDeclarator>,
    file: string,
  ) => {
    const rawComponent = rawComponentPath.node;
    const programPath = rawComponentPath.findParent((path) =>
      path.isProgram(),
    ) as NodePath<t.Program>;

    const isRawComponentPathInProgramScope =
      t.isIdentifier(rawComponent.id) &&
      programPath.scope.hasOwnBinding(rawComponent.id.name);

    if (!isReact || !options.auto || !isRawComponentPathInProgramScope) return; // doesn't support Preact yet

    const rawComponentParentPath = rawComponentPath.parentPath;

    if (
      rawComponentParentPath.isCallExpression() &&
      t.isIdentifier(rawComponentParentPath.node.callee, { name: 'block' }) // probably need a import level check later
    )
      return;

    let componentPath: NodePath<
      t.FunctionDeclaration | t.FunctionExpression | t.ArrowFunctionExpression
    >;

    // Next.js React Server Components support
    if (typeof options.auto === 'object' && options.auto.rsc) {
      const directives = programPath.node.directives;
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

      componentPath = rawComponentPath.get('init') as NodePath<
        t.FunctionExpression | t.ArrowFunctionExpression
      >;
    } else {
      componentPath = rawComponentPath as NodePath<t.FunctionDeclaration>;
    }

    if (!t.isIdentifier(rawComponent.id)) return;
    if (!isComponent(rawComponent.id.name)) return;

    const globalPath = rawComponentPath.findParent(
      (path) => path.parentPath?.isProgram() || path.isProgram(),
    )!;
    const comment =
      rawComponent.leadingComments?.[0] ||
      rawComponentParentPath.node.leadingComments?.[0] ||
      globalPath.node.leadingComments?.[0];

    if (comment?.value.includes('million-ignore')) {
      // eslint-disable-next-line no-console
      console.log(
        dim(` ○ ${yellow(`<${rawComponent.id.name}>`)} was ignored`),
      );
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

    const info = {
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
          info.bailout = true;
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
            info.bailout = true;
            return path.stop();
          }

          if (isSpecialElement) {
            info.components++;
            return path.skip();
          }
        }
        if (t.isJSXIdentifier(type) && isComponent(type.name)) {
          info.components++;
          return path.skip();
        }

        info.elements++;
      },
      JSXSpreadChild(path) {
        info.components++;
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
          info.components++;
          return path.skip();
        }

        if (!t.isLiteral(path.node.expression)) info.expressions++;
        if (!t.isJSXAttribute(path.parent)) path.skip();
      },
      JSXSpreadAttribute(path) {
        info.components++;
        path.skip();
      },
      JSXAttribute(path) {
        const attribute = path.node;
        // twin.macro + styled-components / emotion support
        if (hasStyledAttributes(attribute) || attribute.name.name === 'ref') {
          info.components++;
          return path.skip();
        }
        if (!t.isLiteral(attribute.value)) info.attributes++;
      },
      JSXText(path) {
        if (path.node.value.trim() !== '') info.text++;
      },
      ReturnStatement(path) {
        if (path.scope !== returnStatementPath.scope) return;
        info.returns++;
        if (info.returns > 1) {
          info.bailout = true;
          return path.stop();
        }
      },
    });

    const averageDepth = calcAverageTreeDepth(
      resolvePath(argumentPath).node as
        | t.JSXElement
        | t.JSXFragment
        | t.JSXText
        | t.JSXExpressionContainer
        | t.JSXSpreadChild,
    );

    const good = info.elements + info.attributes + info.text;
    const bad = info.components + info.expressions;
    const improvement = (good - bad) / (good + bad);

    const threshold =
      typeof options.auto === 'object' && options.auto.threshold
        ? options.auto.threshold
        : 0.1 - averageDepth * 0.01;

    if (
      isNaN(improvement) ||
      improvement <= threshold ||
      info.bailout ||
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

    const block = programPath.scope.hasBinding('block')
      ? t.identifier('block')
      : addNamedCache(
          'block',
          options.server ? 'million/react-server' : 'million/react',
          rawComponentPath,
          programPath,
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
      rawComponentPath.replaceWith(rawComponent.id);
      rewrittenVariableDeclarationPath = rawComponentParentPath.insertBefore(
        rewrittenComponentNode,
      )[0];
    } else if (rawComponentPath.isVariableDeclarator()) {
      rewrittenVariableDeclarationPath = rawComponentParentPath.replaceWith(
        rewrittenComponentNode,
      )[0];
    } else {
      rewrittenVariableDeclarationPath = rawComponentPath.replaceWith(
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
    handleVisitorError(
      () => visitor(rewrittenComponentPath, new Map(), file),
      'info',
    );
  };
};

export const calcAverageTreeDepth = (
  jsx:
    | t.JSXElement
    | t.JSXFragment
    | t.JSXText
    | t.JSXExpressionContainer
    | t.JSXSpreadChild,
  stack: { node: typeof jsx; depth: number }[] = [{ node: jsx, depth: 0 }],
  depths: number[] = [],
): number => {
  if (t.isJSXText(jsx) || t.isJSXSpreadChild(jsx)) return depths.length;

  while (stack.length > 0) {
    const current = stack.pop()!;
    const node = current.node;
    const depth = current.depth;

    if (t.isJSXText(node) || t.isJSXSpreadChild(node)) continue;

    if (t.isJSXExpressionContainer(node)) {
      depths.push(depth);
    } else {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i]!;
        calcAverageTreeDepth(child, stack, depths);
        stack.push({ node: child, depth: depth + 1 });
      }
    }
  }

  if (depths.length === 0) return 0;
  if (depths.length === 1) return depths[0]!;

  const sum = depths.reduce((a, b) => a + b, 0);

  return sum / depths.length;
};
