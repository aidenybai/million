import { IS_VOID_ELEMENT } from './constants';
import { setAttribute } from './dom';
import type { Edit, Props, VElement, VNode } from './types';

class Hole {
  hole: string;
  constructor(hole: string) {
    this.hole = hole;
  }
  toString() {
    throw new Error(`props.${this.hole} cannot be interpolated.`);
  }
}

const holeProxy = new Proxy(
  {},
  {
    get(_, prop: string) {
      return new Hole(prop);
    },
  },
);

export const renderToTemplate = (
  vnode?: VNode,
  edits: Edit[] = [],
  path: number[] = [],
): string => {
  if (!vnode) return '';
  if (typeof vnode === 'string') return vnode;

  let props = '';
  let children = '';
  const current: Edit = {
    path,
    edits: [],
  };

  for (let name in vnode.props) {
    const value = vnode.props[name];
    if (name === 'key' || name === 'ref' || name === 'children') {
      continue;
    }
    if (name === 'className') name = 'class';
    if (name === 'for') name = 'htmlFor';

    if (value instanceof Hole) {
      current.edits.push({
        type: 'attribute',
        hole: value.hole,
        name,
      });
      continue;
    }

    if (!name.startsWith('on')) {
      props += ` ${name}="${String(value)}"`;
    }
  }

  if (IS_VOID_ELEMENT.test(vnode.tag)) return `<${vnode.tag}${props} />`;

  let realIndex = 0;
  for (let i = 0, j = vnode.children?.length || 0; i < j; ++i) {
    const child = vnode.children?.[i];
    if (child instanceof Hole) {
      current.edits.push({
        type: 'insert',
        hole: child.hole,
        index: i,
      });
    } else {
      children += renderToTemplate(child, edits, [...path, realIndex]);
      realIndex++;
    }
  }

  edits.push(current);

  return `<${vnode.tag}${props}>${children}</${vnode.tag}>`;
};

export const block = (fn: (props?: Props) => VElement) => {
  const vnode = fn(holeProxy);
  const edits: Edit[] = [];

  const template = document.createElement('template');
  const content = renderToTemplate(vnode, edits, []);
  template.innerHTML = content;

  return (props: Props = {}) => {
    const root = template.content.cloneNode(true) as DocumentFragment;

    for (let i = 0, j = edits.length; i < j; ++i) {
      const current = edits[i]!;
      let el = root.firstChild as HTMLElement;
      for (let k = 0, l = current.path.length; k < l; ++k) {
        el = el.childNodes.item(current.path[k]!) as HTMLElement;
      }
      for (let k = 0, l = current.edits.length; k < l; ++k) {
        const edit = current.edits[k]!;
        const value = props[edit.hole];

        if (edit.type === 'attribute') {
          setAttribute(el, edit.name, value);
        }
        if (edit.type === 'insert') {
          const refNode = el.childNodes.item(edit.index) as HTMLElement;
          el.insertBefore(document.createTextNode(String(value)), refNode);
        }
      }
    }

    return root.firstChild as HTMLElement;
  };
};
