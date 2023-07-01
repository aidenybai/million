import {
  X_CHAR,
  VOID_ELEMENTS,
  EventFlag,
  StyleAttributeFlag,
  SvgAttributeFlag,
  AttributeFlag,
  ChildFlag,
  BlockFlag,
  SetHas$,
} from './constants';
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
  // TODO: refactor this so there is not an extra wrapper element
  if (typeof vnode === 'object' && '$' in vnode) {
    edits.push({
      p: path,
      e: [
        {
          /* type */ t: ChildFlag,
          /* name */ n: null,
          /* value */ v: null,
          /* hole */ h: vnode.$ as 'string',
          /* index */ i: 0,
          /* listener */ l: null,
          /* patch */ p: null,
          /* block */ b: null,
        },
      ],
      i: [],
    });

    return '<slot/>';
  }

  let props = '';
  let children = '';
  const current: Edit = {
    p: path, // The location of the edit in in the virtual node tree
    e: [], // Occur on mount + patch
    i: [], // Occur before mount
  };

  for (let name in vnode.props) {
    const value = vnode.props[name];
    if (name === 'key' || name === 'ref' || name === 'children') {
      continue;
    }
    if (name === 'className') name = 'class';
    if (name === 'htmlFor') name = 'for';

    if (name.startsWith('on')) {
      const isValueHole = '$' in value;
      // Make edits monomorphic
      if (isValueHole) {
        current.e.push({
          /* type */ t: EventFlag,
          /* name */ n: name.slice(2),
          /* value */ v: null,
          /* hole */ h: value.$,
          /* index */ i: null,
          /* listener */ l: null,
          /* patch */ p: null,
          /* block */ b: null,
        });
      } else {
        current.i!.push({
          /* type */ t: EventFlag,
          /* name */ n: name.slice(2),
          /* value */ v: null,
          /* hole */ h: null,
          /* index */ i: null,
          /* listener */ l: value,
          /* patch */ p: null,
          /* block */ b: null,
        });
      }

      continue;
    }

    if (value) {
      if (typeof value === 'object' && '$' in value) {
        if (name === 'style') {
          current.e.push({
            /* type */ t: StyleAttributeFlag,
            /* name */ n: name,
            /* value */ v: null,
            /* hole */ h: value.$,
            /* index */ i: null,
            /* listener */ l: null,
            /* patch */ p: null,
            /* block */ b: null,
          });
        } else if (name.charCodeAt(0) === X_CHAR) {
          current.e.push({
            /* type */ t: SvgAttributeFlag,
            /* name */ n: name,
            /* value */ v: null,
            /* hole */ h: value.$,
            /* index */ i: null,
            /* listener */ l: null,
            /* patch */ p: null,
            /* block */ b: null,
          });
        } else {
          current.e.push({
            /* type */ t: AttributeFlag,
            /* name */ n: name,
            /* value */ v: null,
            /* hole */ h: value.$,
            /* index */ i: null,
            /* listener */ l: null,
            /* patch */ p: null,
            /* block */ b: null,
          });
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

  if (SetHas$.call(VOID_ELEMENTS, vnode.type)) {
    if (current.e.length) edits.push(current);
    return `<${vnode.type}${props} />`;
  }

  // 👎: 'foo' + Block + 'bar' => 'foobaz'.
  //                                      ↕️ Block edit here
  // 👍: 'foo' + Block + 'bar'   => 'foo', 'bar'
  let canMergeString = false;
  for (let i = 0, j = vnode.props.children?.length || 0, k = 0; i < j; ++i) {
    const child = vnode.props.children?.[i];
    if (child === null || child === undefined || child === false) continue;

    if (typeof child === 'object' && '$' in child) {
      current.e.push({
        /* type */ t: ChildFlag,
        /* name */ n: null,
        /* value */ v: null,
        /* hole */ h: child.$,
        /* index */ i,
        /* listener */ l: null,
        /* patch */ p: null,
        /* block */ b: null,
      });
      continue;
    }

    if (child instanceof AbstractBlock) {
      current.i!.push({
        /* type */ t: BlockFlag,
        /* name */ n: null,
        /* value */ v: null,
        /* hole */ h: null,
        /* index */ i,
        /* listener */ l: null,
        /* patch */ p: null,
        /* block */ b: child,
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
        current.i!.push({
          /* type */ t: ChildFlag,
          /* name */ n: null,
          /* value */ v: value,
          /* hole */ h: null,
          /* index */ i,
          /* listener */ l: null,
          /* patch */ p: null,
          /* block */ b: null,
        });
        continue;
      }
      canMergeString = true;
      children += value;
      k++;
      continue;
    }

    canMergeString = false;
    const newPath = path.slice();
    newPath.push(k++);
    children += renderToTemplate(child, edits, newPath);
  }

  if (current.i!.length || current.e.length) edits.push(current);

  return `<${vnode.type}${props}>${children}</${vnode.type}>`;
};
