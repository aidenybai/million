import * as t from '@babel/types';
import { dim, green, red, underline, yellow } from 'kleur/colors';
import {
  addNamedCache,
  handleVisitorError,
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
        dim(`⚡ ${yellow(`<${rawComponent.id.name}>`)} was ignored.`),
      );
      return;
    }

    const returnStatementPath = componentPath
      .get('body')
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
    };
    returnStatementPath.traverse({
      JSXElement(path) {
        const type = path.node.openingElement.name;
        if (t.isJSXMemberExpression(type) && isComponent(type.property.name)) {
          const isContext =
            t.isJSXIdentifier(type.object) && type.property.name === 'Provider';
          const isStyledComponent =
            t.isJSXIdentifier(type.object) && type.object.name === 'styled';

          if (isContext || isStyledComponent) {
            info.bailout = true;
            return;
          }
        }
        if (t.isJSXIdentifier(type) && isComponent(type.name)) {
          info.components++;
          return;
        }

        info.elements++;
      },
      JSXExpressionContainer(path) {
        if (!t.isLiteral(path.node.expression)) info.expressions++;
      },
      JSXAttribute(path) {
        const attribute = path.node;
        // twin.macro + styled-components / emotion support
        if (attribute.name.name === 'tw' || attribute.name.name === 'css') {
          info.bailout = true;
          return;
        }
        if (!t.isLiteral(attribute.value)) info.attributes++;
      },
      JSXText(path) {
        if (path.node.value.trim() !== '') info.text++;
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

    if (info.bailout) return;

    const good = info.elements + info.attributes + info.text;
    const bad = info.components + info.expressions;
    const improvement = (good - bad) / (good + bad);

    const threshold =
      typeof options.auto === 'object' && options.auto.threshold
        ? options.auto.threshold
        : 0.1;

    if (isNaN(improvement) || improvement <= threshold) return;

    const improvementFormatted = isFinite(improvement)
      ? (improvement * 100).toFixed(0)
      : '∞';

    const depthFormatted = Number(averageDepth.toFixed(2));

    if (!options.mute) {
      // eslint-disable-next-line no-console
      console.log(
        styleSecondaryMessage(
          `${yellow(
            `<${rawComponent.id.name}>`,
          )} was automatically optimized. We estimate reconciliation to be ${green(
            underline(`~${improvementFormatted}%`),
          )} faster.\n${dim(
            `Found ${green(info.elements)} nodes, ${green(
              info.attributes,
            )} attributes, ${green(info.text)} texts, ${red(
              info.components,
            )} components, and ${red(
              info.expressions,
            )} expressions. Average depth is ${green(depthFormatted)}. (${green(
              good,
            )} - ${red(bad)}) / (${green(good)} + ${red(bad)}) = ~${green(
              improvementFormatted,
            )}%.`,
          )}`,
          '⚡',
        ),
      );
    }

    const block = programPath.scope.hasBinding('block')
      ? t.identifier('block')
      : addNamedCache(
          'block',
          options.server ? 'million/react-server' : 'million/react',
          rawComponentPath,
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
        t.objectPattern([
          t.objectProperty(rawComponent.id, rawComponent.id, false, true),
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
    const visitor = callExpressionVisitor(options, isReact);
    handleVisitorError(
      () => visitor(rewrittenComponentPath, new Map(), file),
      options.mute,
    );
    rewrittenComponentPath.skip();
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
