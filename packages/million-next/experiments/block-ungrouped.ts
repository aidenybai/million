import { IS_VOID_ELEMENT } from './constants';
import type { Edit, Props, VElement, VNode } from './types';

class Hole {
  hole: string;
  constructor(hole: string) {
    this.hole = hole;
  }
}

// eslint-disable-next-line func-names
Hole.prototype.toString = function () {
  return this.hole;
};

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

  for (let i = 0, j = vnode.children?.length || 0; i < j; ++i) {
    const child = vnode.children?.[i];
    if (child instanceof Hole) {
      current.edits.push({
        type: 'insert',
        hole: child.hole,
        index: i,
      });
    } else {
      children += renderToTemplate(child, edits, [...path, i]);
    }
  }

  edits.push(current);

  return `<${vnode.tag}${props}>${children}</${vnode.tag}>`;
};

export const block = (fn: (props?: Props) => VElement) => {
  const vnode = fn(holeProxy);
  const edits: Edit[] = [];

  const template = document.createElement('template');
  template.innerHTML = renderToTemplate(vnode, edits, []);

  return (props: Props = {}) => {
    const root = template.content.cloneNode(true) as DocumentFragment;

    for (let i = 0, j = edits.length; i < j; ++i) {
      const current = edits[i]!;
      let el = root.firstChild as HTMLElement;
      for (let k = 0, l = current.path.length; k < l; ++k) {
        el = el.childNodes[current.path[k]!] as HTMLElement;
      }
      for (let k = 0, l = current.edits.length; k < l; ++k) {
        const edit = current.edits[k]!;
        const value = props[edit.hole];

        if (edit.type === 'attribute') {
          if (edit.name.startsWith('on')) {
            const event = edit.name.slice(2).toLowerCase();
            el.addEventListener(event, value);
          } else if (value !== undefined && value !== null) {
            if (
              el[edit.name] !== undefined &&
              el[edit.name] !== null &&
              !Reflect.has(el.style, edit.name) &&
              !(el instanceof SVGElement) &&
              edit.name in el
            ) {
              el[edit.name] = value;
            } else {
              el.setAttribute(edit.name, String(value));
            }
          }
        }
        if (edit.type === 'insert') {
          el.insertBefore(
            document.createTextNode(String(value)),
            el.childNodes[edit.index] as HTMLElement,
          );
        }
      }
    }

    return root.firstChild as HTMLElement;
  };
};
