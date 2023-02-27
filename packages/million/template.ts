import { setHas$ } from './dom';
import { AbstractBlock } from './types';
import type { Edit, VNode } from './types';

const X_CHAR = 120;
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
  vnode: VNode,
  edits: Edit[] = [],
  path: number[] = [],
): string => {
  if (typeof vnode === 'string') return vnode;
  if (
    typeof vnode === 'number' ||
    typeof vnode === 'bigint' ||
    vnode === true
  ) {
    return String(vnode);
  }
  if (vnode === null || vnode === undefined || vnode === false) return '';

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
    if (name === 'htmlFor') name = 'for';

    if (name.startsWith('on')) {
      const isValueHole = '__key' in value;
      // Make objects monomorphic
      current.edits.push({
        type: 'event',
        listener: isValueHole ? value.__key : value,
        name,
        hole: isValueHole ? value.__key : undefined,
        value: undefined,
        index: undefined,
        patch: undefined,
        block: undefined,
      });

      continue;
    }

    if (typeof value === 'object' && '__key' in value) {
      current.edits.push({
        type:
          name === 'style'
            ? 'style'
            : name.charCodeAt(0) === X_CHAR
            ? 'svg'
            : 'attribute',
        hole: value.__key,
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

  if (setHas$.call(VOID_ELEMENTS, vnode.type)) {
    return `<${vnode.type}${props} />`;
  }

  // 👎: 'foo' + Block + 'bar' => 'foobaz'.
  //                                      ↕️ Block edit here
  // 👍: 'foo' + Block + 'bar'   => 'foo', 'bar'
  let canMergeString = false;
  for (let i = 0, j = vnode.props.children?.length || 0, k = 0; i < j; ++i) {
    const child = vnode.props.children?.[i];
    if (child === null || child === undefined || child === false) continue;

    if (typeof child === 'object' && '__key' in child) {
      current.edits.push({
        type: 'child',
        hole: child.__key,
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
        type: 'block',
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

    if (
      typeof child === 'string' ||
      typeof child === 'number' ||
      typeof child === 'bigint'
    ) {
      const value =
        typeof child === 'number' || typeof child === 'bigint'
          ? String(child)
          : child;
      if (canMergeString) {
        current.inits.push({
          index: i,
          value,
        });
        continue;
      }
      canMergeString = true;
      children += value;
      k++;
      continue;
    }

    canMergeString = false;
    children += renderToTemplate(child, edits, [...path, k++]);
  }

  if (current.inits.length || current.edits.length) {
    edits.push(current);
  }

  return `<${vnode.type}${props}>${children}</${vnode.type}>`;
};
