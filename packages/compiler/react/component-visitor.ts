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

    if (t.isVariableDeclarator(component)) {
      if (
        !t.isArrowFunctionExpression(component.init) &&
        !t.isFunctionExpression(component.init)
      ) {
        return;
      }
      if (t.isCallExpression(component.init)) return;
      actualFunctionPath = componentPath.get('init') as NodePath<
        t.FunctionExpression | t.ArrowFunctionExpression
      >;
    } else {
      actualFunctionPath = componentPath as NodePath<t.FunctionDeclaration>;
    }

    if (!t.isIdentifier(component.id)) return;
    if (!isComponent(component.id.name)) return;

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
    };
    returnStatementPath?.traverse({
      JSXElement(path) {
        const type = path.node.openingElement.name;
        if (
          t.isJSXMemberExpression(type) &&
          isComponent(type.property.name) &&
          t.isJSXIdentifier(type.object) &&
          type.object.name === 'Provider'
        ) {
          info.bailout = true;
          return;
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
        if (!t.isLiteral(path.node.value)) info.attributes++;
      },
    });

    if (info.bailout) return;

    const good = info.elements + info.attributes + info.text;
    const bad = info.components + info.expressions;
    const improvement = (good - bad) / (good + bad);

    const threshold =
      typeof options.auto === 'object' && options.auto.threshold
        ? options.auto.threshold
        : 0.1;

    if (isNaN(improvement) || improvement < threshold) return;

    const improvementFormatted = isFinite(improvement)
      ? (improvement * 100).toFixed(0)
      : '∞';

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
            )} components, and ${red(info.expressions)} expressions. (${green(
              good,
            )} - ${red(bad)}) / (${green(good)} + ${red(bad)}) = ~${green(
              improvementFormatted,
            )}%`,
          )}`,
          '⚡',
        ),
      );
    }

    const programPath = componentPath.findParent((path) =>
      path.isProgram(),
    ) as NodePath<t.Program>;

    // RSC support
    if (options.server) {
      programPath.unshiftContainer(
        'directives',
        t.directive(t.directiveLiteral('use client')),
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

    (componentPath.isVariableDeclarator()
      ? componentPath.parentPath
      : componentPath
    ).replaceWith(rewrittenComponentNode);

    const rewrittenComponentPath = componentPath.get(
      'declarations.0.init',
    ) as NodePath<t.CallExpression>;

    rewrittenComponentPath.scope.crawl();
    const visitor = callExpressionVisitor(options, isReact);
    handleVisitorError(
      () => visitor(rewrittenComponentPath, new Map(), file),
      options.mute,
    );
    rewrittenComponentPath.skip();
  };
};
