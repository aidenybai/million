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
import type { Edit, Props, VNode } from './types';

export const renderToTemplate = (
  vnode: VNode,
  vprops: Props = {},
  edits: Edit[] = [],
  path: number[] = [],
): string => {
  // if (typeof vnode === 'string') return vnode.replace('abcdefg', '');
  if (
    typeof vnode === 'number' ||
    typeof vnode === 'bigint' ||
    vnode === true
  ) {
    return String(vnode);
  }
  if (vnode === null || vnode === undefined || vnode === false) return '';
  // TODO: refactor this so there is not an extra wrapper element
  if (typeof vnode === 'string' && vnode.includes('abcdefg')) {
    edits.push({
      p: path,
      e: [
        {
          /* type */ t: ChildFlag,
          /* name */ n: null,
          /* value */ v: null,
          /* hole */ h: vnode.replace('abcdefg', ''),
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
  if (typeof vnode === 'string') return vnode.replace('abcdefg', '');

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
      const isValueHole = value.includes('abcdefg');
      // Make edits monomorphic
      if (isValueHole) {
        current.e.push({
          /* type */ t: EventFlag,
          /* name */ n: name.slice(2),
          /* value */ v: null,
          /* hole */ h: value.replace('abcdefg', ''),
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
      if (typeof value === 'string' && value.includes('abcdefg')) {
        if (name === 'style') {
          current.e.push({
            /* type */ t: StyleAttributeFlag,
            /* name */ n: name,
            /* value */ v: null,
            /* hole */ h: value.replace('abcdefg', ''),
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
            /* hole */ h: value.replace('abcdefg', ''),
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
            /* hole */ h: value.replace('abcdefg', ''),
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
          const property = insertHyphenAndLowerCase(
            key.replace('abcdefg', ''),
            vprops,
          );
          style += `${property}:${convertStyle(String(value[key]), vprops)};`;
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

    if (typeof child === 'string' && child.includes('abcdefg')) {
      current.e.push({
        /* type */ t: ChildFlag,
        /* name */ n: null,
        /* value */ v: null,
        /* hole */ h: child.replace('abcdefg', ''),
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
    children += renderToTemplate(child, vprops, edits, newPath);
  }

  if (current.i!.length || current.e.length) edits.push(current);

  return `<${vnode.type}${props}>${children}</${vnode.type}>`;
};

const insertHyphenAndLowerCase = (str: string, props: Props) => {
  const target: string = str in props ? props[str] : str;
  // console.log(str, props, target);
  return target.replace(/[A-Z]/g, (match) => {
    return `-${match.toLowerCase()}`;
  });
};

const convertStyle = (value: string, props: Props): string => {
  const replaced = value.includes('abcdefg')
    ? value.replace('abcdefg', '')
    : value;
  return replaced in props ? props[replaced] : replaced;
};
