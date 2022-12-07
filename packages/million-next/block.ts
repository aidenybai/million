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
    // {prop} is okay, but {prop + 'foo'}, {prop + 123}, etc. is not
    throw new Error(`props.${this.hole} cannot be interpolated.`);
  }
}

const holeProxy = new Proxy(
  {},
  {
    // A universal getter will return a Hole instance if props[any] is accessed
    // Allows code to identify holes in virtual nodes
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

  class Block {
    el?: HTMLElement;
    props?: Props;
    patch(props?: Props | null): HTMLElement {
      const root = this.el as HTMLElement;
      if (!props) return root;
      for (let i = 0, j = edits.length; i < j; ++i) {
        const current = edits[i]!;
        const el = current.el ?? root;
        for (let k = 0, l = current.edits.length; k < l; ++k) {
          const edit = current.edits[k]!;
          const value = props[edit.hole];
          if (value === this.props?.[edit.hole]) continue;
          if (edit.type === EditType.Attribute) {
            setAttribute(el, edit.name, value);
          }
          if (edit.type === EditType.Child) {
            if (el.childNodes.length === 1) {
              el.textContent = String(value);
              continue;
            }
            const node = document.createTextNode(String(value));
            const child =
              edit.index < el.childNodes.length
                ? el.childNodes.item(edit.index)
                : el.lastChild;

            el.replaceChild(node, child as ChildNode);
          }
        }
      }

      return root;
    }
    remove() {
      this.el?.remove();
    }
    mount(props?: Props | null): HTMLElement {
      const clone = template.content.cloneNode(true) as DocumentFragment;
      const root = clone.firstChild as HTMLElement;
      if (!props) return root;
      this.props = props;
      this.el = root;

      for (let i = 0, j = edits.length; i < j; ++i) {
        const current = edits[i]!;
        let el = current.el ?? root;
        if (!current.el) {
          for (let k = 0, l = current.path.length; k < l; ++k) {
            el = el.childNodes.item(current.path[k]!) as HTMLElement;
          }
          current.el = el;
        }
        for (let k = 0, l = current.edits.length; k < l; ++k) {
          const edit = current.edits[k]!;
          const value = props[edit.hole];
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
        }
      }

      return root;
    }
  }

  return new Block();
};
