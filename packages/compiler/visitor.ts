import { addNamed } from '@babel/helper-module-imports';
import * as t from '@babel/types';
import { renderToTemplate, renderToString } from './render';
import { chainOrLogic } from './utils';
import type { NodePath } from '@babel/core';
import type { AstEdit, AstEditBase } from './types';

export const visitCallExpression = (path: NodePath<t.CallExpression>) => {
  if (t.isIdentifier(path.node.callee, { name: 'block' })) {
    const blockFunction = path.scope.getBinding(path.node.callee.name);
    if (!blockFunction) return;
    const importSource = blockFunction.path.parent;
    if (
      !t.isVariableDeclarator(path.parentPath.node) ||
      importSource.type !== 'ImportDeclaration' ||
      // Currently uses includes. Fix this because million/react could be included
      !importSource.source.value.includes('million')
    ) {
      return;
    }

    // eslint-disable-next-line prefer-const
    let [fn, shouldUpdate] = path.node.arguments;
    if (!fn) return;
    const [props] = (fn as t.ArrowFunctionExpression).params as (
      | t.ObjectPattern
      | t.Identifier
    )[];

    if (t.isArrowFunctionExpression(fn) && t.isJSXElement(fn.body)) {
      const edits: AstEdit[] = [];

      const holes = t.isObjectPattern(props)
        ? Object.keys(props.properties).map((key) => {
            return props.properties[key].key.name;
          })
        : [];

      const template = renderToTemplate(fn.body, edits, [], holes);

      const editsArray = t.arrayExpression(
        edits.map((edit) => {
          const properties: t.ArrayExpression[] = [];

          for (let i = 0, j = edit.edits.length; i < j; ++i) {
            const { type, name, hole, listener, value, index } = edit.edits[
              i
            ] as AstEditBase;

            properties.push(
              t.arrayExpression([
                type,
                name ?? t.nullLiteral(),
                value ?? t.nullLiteral(),
                hole ?? t.nullLiteral(),
                index ?? t.nullLiteral(),
                listener ?? t.nullLiteral(),
                t.nullLiteral(),
                t.nullLiteral(),
              ]),
            );
          }

          let root: t.MemberExpression | undefined;
          for (let i = 0, j = edit.path.length; i < j; ++i) {
            root = t.memberExpression(
              root ?? t.identifier('el'),
              t.identifier('firstChild'),
            );

            for (let k = 0, l = edit.path[i]!; k < l; ++k) {
              root = t.memberExpression(root, t.identifier('nextSibling'));
            }
          }

          return t.objectExpression([
            t.objectProperty(
              t.identifier('path'),
              root ? t.nullLiteral() : t.arrayExpression([]),
            ),
            t.objectProperty(
              t.identifier('edits'),
              t.arrayExpression(properties),
            ),
            t.objectProperty(t.identifier('inits'), t.arrayExpression([])),
            t.objectProperty(
              t.identifier('extractEl'),
              root
                ? t.arrowFunctionExpression([t.identifier('el')], root)
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

      if (!shouldUpdate && props && !t.isIdentifier(props)) {
        const { properties } = props;
        shouldUpdate = t.arrowFunctionExpression(
          [t.identifier('oldProps'), t.identifier('newProps')],
          chainOrLogic(
            ...properties
              .filter((property) => t.isObjectProperty(property))
              .map((property) => {
                const key = (property as t.ObjectProperty).key as t.Identifier;
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
          t.isArrowFunctionExpression(shouldUpdate)
            ? shouldUpdate
            : t.arrowFunctionExpression([], t.booleanLiteral(true)),
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
                t.memberExpression(t.identifier('props'), t.identifier('key')),
              ),
              t.logicalExpression(
                '??',
                t.identifier('shouldUpdate'),
                shouldUpdateVariable,
              ),
            ]),
          ),
        ]),
      );

      path.parentPath.parentPath?.insertBefore(variables);
      path.replaceWith(t.returnStatement(blockFactory));
    }
  }
};

// export const compileEdit = (current: AstEdit) => {
//   let el: t.MemberExpression | undefined;
//   const expressions: t.Expression[] = [];
//   for (let i = 0, j = current.path.length; i < j; ++i) {
//     el = t.memberExpression(
//       el ?? t.identifier('el'),
//       t.identifier('firstChild'),
//     );

//     for (let k = 0, l = current.path[i]!; k < l; ++k) {
//       el = t.memberExpression(el, t.identifier('nextSibling'));
//     }
//   }

//   for (let i = 0, j = current.edits.length; i < j; ++i) {
//     const edit = current.edits[i]!;
//     const { type, name, value, hole, index, listener } = edit;

//     if (type.value === 'child') {
//       if (holeValue instanceof AbstractBlock) {
//         holeValue.mount(el);
//         continue;
//       }
//       // insertText() on mount, setText() on patch
//       insertText(el, String(holeValue), index);
//     } else if (type === 'event') {
//       const patch = createEventListener(
//         el,
//         name,
//         // Events can be either a hole or a function
//         hole ? holeValue : listener,
//       );
//       if (hole) {
//         edit[Edits.PATCH] = patch;
//       }
//     } else if (type === 'attribute') {
//       expressions.push(t.callExpression(setAttribute, [el, name, holeValue]));
//       setAttribute(el, name, holeValue);
//     } else if (type === 'style') {
//       if (typeof holeValue === 'string') {
//         setStyleAttribute(el, name, holeValue);
//       } else {
//         for (const style in holeValue) {
//           setStyleAttribute(el, style, holeValue[style]);
//         }
//       }
//     } else {
//       setSvgAttribute(el, name, holeValue);
//     }
//   }
// };
