import { AbstractBlock, EditType, Hole } from './types';
import { setHas$ } from './dom';
import type { Edit, VElement } from './types';

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'basefont',
  'bgsound',
  'br',
  'col',
  'command',
  'embed',
  'frame',
  'hr',
  'image',
  'img',
  'input',
  'isindex',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'nextid',
  'param',
  'source',
  'track',
  'wbr',
]);

export const renderToTemplate = (
  vnode: VElement,
  edits: Edit[] = [],
  path: number[] = [],
): string => {
  let props = '';
  let children = '';
  const current: Edit = {
    path, // The location of the edit in in the virtual node tree
    edits: [], // Occur on mount + patch
    inits: [], // Occur before mount
  };

  for (let name in vnode.props) {
    const value = vnode.props[name];
    if (name === 'key' || name === 'ref' || name === 'children') {
      continue;
    }
    if (name === 'className') name = 'class';
    if (name === 'for') name = 'htmlFor';

    if (name.startsWith('on')) {
      const isValueHole = value instanceof Hole;
      // Make objects monomorphic
      current.edits.push({
        type: EditType.Event,
        listener: isValueHole ? value.key : value,
        name,
        hole: isValueHole ? value.key : undefined,
        value: undefined,
        index: undefined,
        patch: undefined,
        block: undefined,
      });

      continue;
    }

    if (value instanceof Hole) {
      current.edits.push({
        type: EditType.Attribute,
        hole: value.key,
        name,
        listener: undefined,
        value: undefined,
        index: undefined,
        patch: undefined,
        block: undefined,
      });
      continue;
    }

    if (value) props += ` ${name}="${String(value)}"`;
  }

  if (setHas$.call(VOID_ELEMENTS, vnode.tag)) return `<${vnode.tag}${props} />`;

  // 👎: 'foo' + Block + 'bar' => 'foobaz'.
  //                                      ↕️ Block edit here
  // 👍: 'foo' + Block + 'bar'   => 'foo', 'bar'
  let canMergeString = false;
  for (let i = 0, j = vnode.children?.length || 0, k = 0; i < j; ++i) {
    const child = vnode.children?.[i];
    if (!child) continue;

    if (child instanceof Hole) {
      current.edits.push({
        type: EditType.Child,
        hole: child.key,
        index: i,
        name: undefined,
        listener: undefined,
        value: undefined,
        patch: undefined,
        block: undefined,
      });
      continue;
    }

    if (child instanceof AbstractBlock) {
      current.edits.push({
        type: EditType.Block,
        block: child,
        index: i,
        hole: undefined,
        name: undefined,
        listener: undefined,
        value: undefined,
        patch: undefined,
      });
      continue;
    }

    if (typeof child === 'string') {
      if (canMergeString) {
        current.inits.push({
          index: i,
          value: child,
        });
        continue;
      }
      canMergeString = true;
      children += child;
      k++;
      continue;
    }

    canMergeString = false;
    children += renderToTemplate(child, edits, [...path, k++]);
  }

  if (current.inits.length || current.edits.length) {
    edits.push(current);
  }

  return `<${vnode.tag}${props}>${children}</${vnode.tag}>`;
};
