/**
 * PLEASE DO NOT USE THIS IN PRODUCTION. This is technically a proof-of-concept
 * and is _highly_ experimental. Currently, it is mainly used for optimizing the
 * JS Framework Benchmark implementation
 */

// import { addNamed } from '@babel/helper-module-imports';
import * as t from '@babel/types';
import type { NodePath } from '@babel/core';
import {
  hoistElements,
  renderToString,
  renderToTemplate,
} from '../experimental/render';
import { chainOrLogic } from '../experimental/utils';
import type { IrEdit, IrEditBase } from '../experimental/types';
import type { Options } from '../options';

export const visitor =
  (options: Options = {}) =>
  (path: NodePath<t.CallExpression>) => {
    if (!options.optimize) return;
    // TODO: allow aliasing (block as newBlock)
    if (t.isIdentifier(path.node.callee, { name: 'block' })) {
      const blockFunction = path.scope.getBinding(path.node.callee.name);
      if (!blockFunction) return;
      const importSource = blockFunction.path.parent;

      if (
        !t.isVariableDeclarator(path.parentPath.node) ||
        !t.isImportDeclaration(importSource) ||
        !importSource.source.value.includes('million')
      ) {
        return;
      }

      // eslint-disable-next-line prefer-const
      let [fn, _unwrap, shouldUpdate] = path.node.arguments;
      if (!fn) return;
      const [props] = (fn as t.ArrowFunctionExpression).params as (
        | t.ObjectPattern
        | t.Identifier
      )[];

      if (t.isArrowFunctionExpression(fn) && t.isJSXElement(fn.body)) {
        const edits: IrEdit[] = [];

        const holes = t.isObjectPattern(props)
          ? Object.keys(props.properties).map((key) => {
              return props.properties[key].key.name;
            })
          : [];

        const template = renderToTemplate(fn.body, edits, [], holes);

        const paths: number[][] = [];
        let maxPathLength = 0;
        for (let i = 0, j = edits.length; i < j; ++i) {
          const path = edits[i]?.path || [];
          if (path.length > maxPathLength) maxPathLength = path.length;
          paths.push(path);
        }

        const { declarators, accessedIds } = hoistElements(
          paths,
          path,
          importSource.source.value,
        );

        const editsArray = t.arrayExpression(
          edits.map((edit) => {
            const editsProperties: t.ObjectExpression[] = [];
            const initsProperties: t.ObjectExpression[] = [];

            for (let i = 0, j = edit.edits.length; i < j; ++i) {
              const { type, name, hole, listener, value, index } = edit.edits[
                i
              ] as IrEditBase;

              editsProperties.push(
                t.objectExpression([
                  t.objectProperty(t.identifier('t'), type),
                  t.objectProperty(t.identifier('n'), name ?? t.nullLiteral()),
                  t.objectProperty(t.identifier('v'), value ?? t.nullLiteral()),
                  t.objectProperty(t.identifier('h'), hole ?? t.nullLiteral()),
                  t.objectProperty(t.identifier('i'), index ?? t.nullLiteral()),
                  t.objectProperty(
                    t.identifier('l'),
                    listener ?? t.nullLiteral(),
                  ),
                  t.objectProperty(t.identifier('p'), value ?? t.nullLiteral()),
                  t.objectProperty(t.identifier('b'), value ?? t.nullLiteral()),
                ]),
              );
            }

            for (let i = 0, j = edit.inits.length; i < j; ++i) {
              const { type, name, hole, listener, value, index } = edit.inits[
                i
              ] as IrEditBase;

              initsProperties.push(
                t.objectExpression([
                  t.objectProperty(t.identifier('t'), type),
                  t.objectProperty(t.identifier('n'), name ?? t.nullLiteral()),
                  t.objectProperty(t.identifier('v'), value ?? t.nullLiteral()),
                  t.objectProperty(t.identifier('h'), hole ?? t.nullLiteral()),
                  t.objectProperty(t.identifier('i'), index ?? t.nullLiteral()),
                  t.objectProperty(
                    t.identifier('l'),
                    listener ?? t.nullLiteral(),
                  ),
                  t.objectProperty(t.identifier('p'), value ?? t.nullLiteral()),
                  t.objectProperty(t.identifier('b'), value ?? t.nullLiteral()),
                ]),
              );
            }

            return t.objectExpression([
              t.objectProperty(t.identifier('p'), t.nullLiteral()),
              t.objectProperty(
                t.identifier('e'),
                t.arrayExpression(editsProperties),
              ),
              t.objectProperty(
                t.identifier('i'),
                initsProperties.length
                  ? t.arrayExpression(initsProperties)
                  : t.nullLiteral(),
              ),
            ]);
          }),
        );

        const stringToDOM = addNamed(
          path,
          'stringToDOM',
          importSource.source.value,
          {
            nameHint: 'stringToDOM$',
          },
        );

        const shouldUpdateExists =
          (t.isIdentifier(shouldUpdate) && shouldUpdate.name !== 'undefined') ||
          t.isArrowFunctionExpression(shouldUpdate);

        if (!shouldUpdateExists && props && !t.isIdentifier(props)) {
          const { properties } = props;
          shouldUpdate = t.arrowFunctionExpression(
            [t.identifier('oldProps'), t.identifier('newProps')],
            chainOrLogic(
              ...properties
                .filter((property) => t.isObjectProperty(property))
                .map((property) => {
                  const key = (property as t.ObjectProperty)
                    .key as t.Identifier;
                  return t.binaryExpression(
                    '!==',
                    t.optionalMemberExpression(
                      t.identifier('oldProps'),
                      key,
                      false,
                      true,
                    ),
                    t.optionalMemberExpression(
                      t.identifier('newProps'),
                      key,
                      false,
                      true,
                    ),
                  );
                }),
            ),
          );
        }

        const domVariable = path.scope.generateUidIdentifier('dom$');
        const editsVariable = path.scope.generateUidIdentifier('edits$');
        const shouldUpdateVariable =
          path.scope.generateUidIdentifier('shouldUpdate$');
        const getElementsVariable =
          path.scope.generateUidIdentifier('getElements$');

        const variables = t.variableDeclaration('const', [
          t.variableDeclarator(
            domVariable,
            t.callExpression(stringToDOM, [
              t.templateLiteral(
                [
                  t.templateElement({
                    raw: renderToString(template),
                  }),
                ],
                [],
              ),
            ]),
          ),
          t.variableDeclarator(editsVariable, editsArray),
          t.variableDeclarator(
            shouldUpdateVariable,
            shouldUpdateExists
              ? t.nullLiteral()
              : (shouldUpdate as t.Identifier | t.ArrowFunctionExpression),
          ),
          t.variableDeclarator(
            getElementsVariable,
            declarators.length
              ? t.arrowFunctionExpression(
                  [t.identifier('root')],
                  t.blockStatement([
                    t.variableDeclaration('const', declarators),
                    t.returnStatement(t.arrayExpression(accessedIds)),
                  ]),
                )
              : t.nullLiteral(),
          ),
        ]);
        const BlockClass = addNamed(path, 'Block', importSource.source.value, {
          nameHint: 'Block$',
        });

        const blockFactory = t.arrowFunctionExpression(
          [
            t.identifier('props'),
            t.identifier('key'),
            t.identifier('shouldUpdate'),
          ],
          t.blockStatement([
            t.returnStatement(
              t.newExpression(BlockClass, [
                domVariable,
                editsVariable,
                t.identifier('props'),
                t.logicalExpression(
                  '??',
                  t.identifier('key'),
                  t.memberExpression(
                    t.identifier('props'),
                    t.identifier('key'),
                  ),
                ),
                t.logicalExpression(
                  '??',
                  t.identifier('shouldUpdate'),
                  shouldUpdateVariable,
                ),
                getElementsVariable,
              ]),
            ),
          ]),
        );

        path.parentPath.parentPath?.insertBefore(variables);
        path.replaceWith(t.returnStatement(blockFactory));
      }
    }
  };
