import { setHas$ } from './dom';
import { X_CHAR, VOID_ELEMENTS } from './constants';
import { AbstractBlock } from './types';
import type { Edit, VNode } from './types';

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
    getRoot: undefined, // altenative to path
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
      // Make edits monomorphic
      current.edits.push([
        /* type */ 'event',
        /* name */ name,
        /* value */ undefined,
        /* hole */ isValueHole ? value.__key : undefined,
        /* index */ undefined,
        /* listener */ isValueHole ? value.__key : value,
        /* patch */ undefined,
        /* block */ undefined,
      ]);

      continue;
    }

    if (value) {
      if (typeof value === 'object' && '__key' in value) {
        if (name === 'style') {
          current.edits.push([
            /* type */ 'style',
            /* name */ name,
            /* value */ undefined,
            /* hole */ value.__key,
            /* index */ undefined,
            /* listener */ undefined,
            /* patch */ undefined,
            /* block */ undefined,
          ]);
        } else if (name.charCodeAt(0) === X_CHAR) {
          current.edits.push([
            /* type */ 'svg',
            /* name */ name,
            /* value */ undefined,
            /* hole */ value.__key,
            /* index */ undefined,
            /* listener */ undefined,
            /* patch */ undefined,
            /* block */ undefined,
          ]);
        } else {
          current.edits.push([
            /* type */ 'attribute',
            /* name */ name,
            /* value */ undefined,
            /* hole */ value.__key,
            /* index */ undefined,
            /* listener */ undefined,
            /* patch */ undefined,
            /* block */ undefined,
          ]);
        }

        continue;
      }
      if (name === 'style') {
        let style = '';
        for (const key in value) {
          style += `${key}:${String(value[key])};`;
        }
        props += ` style="${style}"`;
        continue;
      }
      props += ` ${name}="${String(value)}"`;
    }
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
      current.edits.push([
        /* type */ 'child',
        /* name */ undefined,
        /* value */ undefined,
        /* hole */ child.__key,
        /* index */ i,
        /* listener */ undefined,
        /* patch */ undefined,
        /* block */ undefined,
      ]);
      continue;
    }

    if (child instanceof AbstractBlock) {
      current.edits.push([
        /* type */ 'block',
        /* name */ undefined,
        /* value */ undefined,
        /* hole */ undefined,
        /* index */ i,
        /* listener */ undefined,
        /* patch */ undefined,
        /* block */ child,
      ]);

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
