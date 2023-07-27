import * as t from '@babel/types';
import { green, underline } from 'kleur/colors';
import {
  addNamedCache,
  isComponent,
  resolveCorrectImportSource,
  resolvePath,
  styleCommentMessage,
  stylePrimaryMessage,
} from './utils';
import { callExpressionVisitor } from './call-expression-visitor';
import type { NodePath } from '@babel/core';
import type { Options } from '../plugin';

export const componentVisitor = (options: Options = {}, isReact = true) => {
  return (
    componentPath: NodePath<t.FunctionDeclaration | t.VariableDeclarator>,
  ) => {
    if (!isReact || !options.auto) return; // doesn't support Preact yet
    if (componentPath.parentPath.isExportNamedDeclaration()) return;
    if (componentPath.parentPath.isExportDefaultDeclaration()) return;
    if (componentPath.parentPath.isCallExpression()) return;

    let functionPath: NodePath<
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
      // get path to function node
      functionPath = componentPath.get('init') as NodePath<
        t.FunctionExpression | t.ArrowFunctionExpression
      >;
    } else {
      functionPath = componentPath as NodePath<t.FunctionDeclaration>;
    }

    if (!t.isIdentifier(component.id)) return;
    if (!isComponent(component.id.name)) return;

    const returnStatementPath = functionPath
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
      fragments: 0,
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
      JSXFragment() {
        info.fragments++;
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
    const bad = info.components + info.expressions + info.fragments;
    const improvement = (good - bad) / (good + bad);

    if (isNaN(improvement) || improvement < 0.1) return;

    const improvementFormatted = isFinite(improvement)
      ? (improvement * 100).toFixed(0)
      : '∞';

    if (!options.mute) {
      // eslint-disable-next-line no-console
      console.log(
        stylePrimaryMessage(
          `<${
            component.id.name
          }> was automatically optimized. We estimate reconciliation to be ${green(
            underline(`~${improvementFormatted}%`),
          )} faster.\n            ${styleCommentMessage(
            'Set the "mute" option to true to disable this message.',
          )}`,
          'ⓘ',
        ),
      );
    }

    const programPath = componentPath.findParent((path) =>
      path.isProgram(),
    ) as NodePath<t.Program>;

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
          t.isFunctionDeclaration(functionPath.node)
            ? t.functionExpression(
                component.id,
                functionPath.node.params,
                functionPath.node.body,
              )
            : functionPath.node,
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
    visitor(rewrittenComponentPath, new Map());
    rewrittenComponentPath.skip();
  };
};
