import { addNamed } from '@babel/helper-module-imports';
import * as t from '@babel/types';
import type { NodePath } from '@babel/core';
import { renderToString, renderToTemplate } from './render';
import { chainOrLogic } from './utils';
import type { IrEdit, IrEditBase, IrPrunedNode, IrTreeNode } from './types';

export const optimize = (path: NodePath<t.CallExpression>) => {
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
        importSource,
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
          t.arrowFunctionExpression(
            [t.identifier('root')],
            t.blockStatement([
              t.variableDeclaration('const', declarators),
              t.returnStatement(t.arrayExpression(accessedIds)),
            ]),
          ),
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

/**
 *  Direct credit to Alexis H. Munsayac (https://github.com/LXSMNSYC)
 *  for the original implementation of this algorithm.
 */
export const hoistElements = (
  paths: number[][],
  path: NodePath<t.CallExpression>,
  importSource: t.ImportDeclaration,
) => {
  const createTreeNode = (): IrTreeNode => ({
    children: [],
    path: undefined,
  });

  const createPrunedNode = (
    index: number,
    parent?: IrPrunedNode,
  ): IrPrunedNode => ({
    index,
    parent,
    path: undefined,
    child: undefined,
    next: undefined,
    prev: undefined,
  });

  const tree = createTreeNode();
  for (let i = 0, j = paths.length; i < j; i++) {
    const path = paths[i]!;

    let prev = tree;
    for (let k = 0, l = path.length; k < l; k++) {
      const index = path[k]!;
      prev.children[index] ||= createTreeNode();
      prev = prev.children[index]!;
      if (k === l - 1) {
        prev.path ||= [];
        prev.path.push(i);
      }
    }
  }

  const prune = (node: IrTreeNode, parent: IrPrunedNode) => {
    let prev = parent;
    for (let i = 0, j = node.children.length; i < j; i++) {
      const treeNode = node.children[i];
      const current = createPrunedNode(i, parent);
      if (prev === parent) {
        prev.child = current;
      } else {
        current.prev = prev;
        prev.next = current;
      }
      prev = current;

      if (treeNode) {
        prev.path = treeNode.path;
        prune(treeNode, current);
      }
    }
  };

  const root = createPrunedNode(0);
  prune(tree, root);

  const getId = () => path.scope.generateUidIdentifier('el$');
  const firstChild = addNamed(path, 'firstChild$', importSource.source.value);
  const nextSibling = addNamed(path, 'nextSibling$', importSource.source.value);

  const declarators: t.VariableDeclarator[] = [];
  const accessedIds: t.Identifier[] = Array(paths.length).fill(
    t.identifier('root'),
  );

  const traverse = (
    node: IrPrunedNode,
    prev: t.Identifier | t.CallExpression,
    isParent?: boolean,
  ) => {
    if (isParent) {
      prev = t.callExpression(
        t.memberExpression(firstChild, t.identifier('call')),
        [prev],
      );
      for (let i = 0, j = node.index; i < j; i++) {
        prev = t.callExpression(
          t.memberExpression(nextSibling, t.identifier('call')),
          [prev],
        );
      }
    } else {
      for (let i = 0, j = node.index - (node.prev?.index ?? 0); i < j; i++) {
        prev = t.callExpression(
          t.memberExpression(nextSibling, t.identifier('call')),
          [prev],
        );
      }
    }

    if (node.child && node.next) {
      const id = getId();
      declarators.push(t.variableDeclarator(id, prev));
      prev = id;
      if (node.path !== undefined) {
        for (let i = 0, j = node.path.length; i < j; ++i) {
          accessedIds[node.path[i]!] = id;
        }
      }
    } else if (node.path !== undefined) {
      const id = getId();
      declarators.push(t.variableDeclarator(id, prev));
      for (let i = 0, j = node.path.length; i < j; ++i) {
        accessedIds[node.path[i]!] = id;
      }
      prev = id;
    }
    if (node.next) {
      traverse(node.next, prev, false);
    }
    if (node.child) {
      traverse(node.child, prev, true);
    }
  };

  if (root.child) {
    traverse(root.child, t.identifier('root'), true);
  }

  return {
    declarators,
    accessedIds,
  };
};
