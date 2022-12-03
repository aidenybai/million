import { IS_VOID_ELEMENT } from './constants';
import { setAttribute } from './dom';
import { EditType } from './types';
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
        type: EditType.Attribute,
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

  for (let i = 0, j = vnode.children?.length || 0, k = 0; i < j; ++i) {
    const child = vnode.children?.[i];
    if (child instanceof Hole) {
      current.edits.push({
        type: EditType.Child,
        hole: child.hole,
        index: i,
      });
    } else {
      children += renderToTemplate(child, edits, [...path, k++]);
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

  return (props: Props = {}): HTMLElement => {
    const root = template.content.cloneNode(true) as DocumentFragment;

    for (let i = 0, j = edits.length; i < j; ++i) {
      const current = edits[i]!;
      let el = current.el ?? (root.firstChild as HTMLElement);
      if (!current.el) {
        for (let k = 0, l = current.path.length; k < l; ++k) {
          el = el.childNodes.item(current.path[k]!) as HTMLElement;
        }
        current.el = el;
      }
      for (let k = 0, l = current.edits.length; k < l; ++k) {
        const edit = current.edits[k]!;
        const value = props[edit.hole];
        if (edit.lastValue !== value) {
          if (edit.type === EditType.Attribute) {
            setAttribute(el, edit.name, value);
          }
          if (edit.type === EditType.Child) {
            const node = document.createTextNode(String(value));
            if (el.hasChildNodes()) {
              el.insertBefore(
                node,
                edit.index < el.childNodes.length
                  ? el.childNodes.item(edit.index)
                  : el.lastChild,
              );
            } else {
              el.appendChild(node);
            }
          }
          edit.lastEl = el;
          edit.lastValue = value;
        } else {
          return edit.lastEl?.cloneNode(true) as HTMLElement;
        }
      }
    }

    return root.firstChild as HTMLElement;
  };
};
