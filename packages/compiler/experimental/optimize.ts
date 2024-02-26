import * as t from '@babel/types';
// import { addNamed } from '@babel/helper-module-imports';
import type { NodePath } from '@babel/core';
import { EventFlag } from '../../million/constants';
import type { Info } from '../babel';
import { addImport } from '../utils/is-use-client';
import { getUniqueId } from '../utils/id';
import { hoistElements, renderToString, renderToTemplate } from './render';
import { createDirtyChecker, createEdit } from './utils';
import type { IrEdit, IrEditBase } from './types';

export const optimize = (
  callExpressionPath: NodePath<t.CallExpression>,
  info: Info,
  holes: string[],
  jsx: t.JSXElement,
): {
  blockFactory: t.ArrowFunctionExpression;
  variables: t.VariableDeclaration;
} => {
  const edits: IrEdit[] = [];
  const template = renderToTemplate(jsx, edits, [], holes);

  const paths: number[][] = [];
  let maxPathLength = 0;
  for (let i = 0, j = edits.length; i < j; ++i) {
    const path = edits[i]?.path || [];
    if (path.length > maxPathLength) maxPathLength = path.length;
    paths.push(path);
  }

  const { declarators, accessedIds } = hoistElements(
    paths,
    callExpressionPath,
    'million',
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
          createEdit({
            type,
            name,
            hole,
            index,
            listener,
            value,
            patch: value,
            block: value,
          }),
        );
      }

      for (let i = 0, j = edit.inits.length; i < j; ++i) {
        const { type, name, hole, listener, value, index } = edit.inits[i]!;

        if (type.value === EventFlag) {
          initsProperties.push(
            createEdit({
              type,
              name,
              hole,
              index,
              listener,
              value,
              patch: value,
              block: value,
            }),
          );
        } else {
          initsProperties.push(
            createEdit({
              type,
              hole: t.nullLiteral(),
              index,
              listener: t.nullLiteral(),
              value,
              patch: t.nullLiteral(),
              block: t.nullLiteral(),
            }),
          );
        }
      }

      return t.objectExpression([
        t.objectProperty(t.identifier('p'), t.arrayExpression()),
        t.objectProperty(t.identifier('e'), t.arrayExpression(editsProperties)),
        t.objectProperty(
          t.identifier('i'),
          initsProperties.length
            ? t.arrayExpression(initsProperties)
            : t.arrayExpression(),
        ),
      ]);
    }),
  );

  const stringToDOM = addImport(
    callExpressionPath,
    'stringToDOM',
    'million',
    info,
  );

  const domVariable = getUniqueId(callExpressionPath, 'd');
  const editsVariable = getUniqueId(callExpressionPath, 'e');
  const shouldUpdateVariable = getUniqueId(callExpressionPath, 'su');
  const getElementsVariable = getUniqueId(callExpressionPath, 'ge');

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
    t.variableDeclarator(shouldUpdateVariable, createDirtyChecker(holes)),
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
  const BlockClass = addNamed(callExpressionPath, 'Block', 'million', {
    nameHint: 'Block$',
  });

  const blockFactory = t.arrowFunctionExpression(
    [t.identifier('props'), t.identifier('key'), t.identifier('shouldUpdate')],
    t.blockStatement([
      t.returnStatement(
        t.newExpression(BlockClass, [
          domVariable,
          editsVariable,
          t.identifier('props'),
          t.logicalExpression(
            '??',
            t.identifier('key'),
            t.memberExpression(t.identifier('props'), t.identifier('key')),
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

  return {
    blockFactory,
    variables,
  };
};
