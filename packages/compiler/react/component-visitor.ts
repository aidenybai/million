import * as t from '@babel/types';
import { dim, green, red, underline, yellow } from 'kleur/colors';
import {
  addNamedCache,
  handleVisitorError,
  isComponent,
  resolveCorrectImportSource,
  resolvePath,
  styleSecondaryMessage,
} from './utils';
import { callExpressionVisitor } from './call-expression-visitor';
import type { NodePath } from '@babel/core';
import type { Options } from '../plugin';

export const componentVisitor = (options: Options = {}, isReact = true) => {
  return (
    componentPath: NodePath<t.FunctionDeclaration | t.VariableDeclarator>,
    file: string,
  ) => {
    if (!isReact || !options.auto) return; // doesn't support Preact yet

    // bail out if it's already wrapped in a block
    if (componentPath.parentPath.isCallExpression()) return;

    let actualFunctionPath: NodePath<
      t.FunctionDeclaration | t.FunctionExpression | t.ArrowFunctionExpression
    >;
    const component = componentPath.node;
    const programPath = componentPath.findParent((path) =>
      path.isProgram(),
    ) as NodePath<t.Program>;

    if (typeof options.auto === 'object' && options.auto.rsc) {
      // Check if there is a "use client" directive at the top of the file
      if (!programPath.node.directives.length) return;
      const directives = programPath.node.directives;
      const hasUseClientDirective = directives.some((directive) => {
        return directive.value.value === 'use client';
      });
      if (!hasUseClientDirective) return;
    }

    if (t.isVariableDeclarator(component)) {
      if (
        !t.isArrowFunctionExpression(component.init) &&
        !t.isFunctionExpression(component.init)
      ) {
        return;
      }
      if (t.isCallExpression(component.init)) return;
      if (component.init.async) return; // RSC
      actualFunctionPath = componentPath.get('init') as NodePath<
        t.FunctionExpression | t.ArrowFunctionExpression
      >;
    } else {
      actualFunctionPath = componentPath as NodePath<t.FunctionDeclaration>;
    }

    if (!t.isIdentifier(component.id)) return;
    if (!isComponent(component.id.name)) return;

    const comment =
      componentPath.get('leadingComments')[0] ??
      componentPath.parentPath.get('leadingComments')[0];

    if (comment?.node.value.includes('million-ignore')) {
      // eslint-disable-next-line no-console
      console.log(dim(`⚡ ${yellow(`<${component.id.name}>`)} was ignored.`));
      return;
    }

    const returnStatementPath = actualFunctionPath
      .get('body')
      .get('body')
      .find((path) => {
        return path.isReturnStatement();
      });
    const argumentPath = returnStatementPath?.get('argument');
    if (!argumentPath) return;
    const resolvedArgumentPath = resolvePath(argumentPath);

    if (
      !resolvedArgumentPath.isJSXElement() &&
      !resolvedArgumentPath.isJSXFragment()
    ) {
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
    returnStatementPath?.traverse({
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
            `<${component.id.name}>`,
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
          resolveCorrectImportSource(options, 'million/react'),
          componentPath,
        );

    const rewrittenComponentNode = t.variableDeclaration('const', [
      t.variableDeclarator(
        component.id,
        t.callExpression(block, [
          t.isFunctionDeclaration(actualFunctionPath.node)
            ? t.functionExpression(
                component.id,
                actualFunctionPath.node.params,
                actualFunctionPath.node.body,
              )
            : actualFunctionPath.node,
        ]),
      ),
    ]);

    const componentParentPath = componentPath.parentPath;
    let rewrittenVariableDeclarationPath: NodePath<t.VariableDeclaration>;

    if (componentParentPath.isExportNamedDeclaration()) {
      componentParentPath.replaceWith(
        t.objectPattern([
          t.objectProperty(component.id, component.id, false, true),
        ]),
      );
      rewrittenVariableDeclarationPath = componentParentPath.insertBefore(
        rewrittenComponentNode,
      )[0];
    } else if (componentParentPath.isExportDefaultDeclaration()) {
      componentPath.replaceWith(t.expressionStatement(component.id));
      rewrittenVariableDeclarationPath = componentParentPath.insertBefore(
        rewrittenComponentNode,
      )[0];
    } else if (componentPath.isVariableDeclarator()) {
      rewrittenVariableDeclarationPath = componentParentPath.replaceWith(
        rewrittenComponentNode,
      )[0];
    } else {
      rewrittenVariableDeclarationPath = componentPath.replaceWith(
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
