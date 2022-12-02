import { IS_VOID_ELEMENT } from '../constants';
import type { Props, VNode, VElement } from '../types';

class Hole {
  hole: string;
  pointer: string;
  prop?: string;

  constructor(hole: string, pointer: number) {
    this.hole = hole;
    this.pointer = `m-${pointer}`;
  }
}

export const renderToString = (vnode?: VNode, holes: Hole[] = []): string => {
  if (!vnode) return '';
  if (typeof vnode === 'string') return vnode;

  let props = '';
  let children = '';

  for (let name in vnode.props) {
    const value = vnode.props[name];
    if (name === 'key' || name === 'ref' || name === 'children') {
      continue;
    }
    if (name === 'className') name = 'class';
    if (name === 'for') name = 'htmlFor';

    if (value instanceof Hole) {
      props += ` ${value.pointer}`;
      value.prop = name;
      holes.push(value);
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
      children += `<h id="${child.pointer}"></h>`;
      holes.push(child);
    } else {
      children += renderToString(child);
    }
  }

  return `<${vnode.tag}${props}>${children}</${vnode.tag}>`;
};

export const block = (fn: (props?: Props) => VElement) => {
  let pointer = 0;
  const holeProxy = new Proxy(
    {},
    {
      get(_, prop: string) {
        return new Hole(prop, pointer++);
      },
    },
  );
  const vnode = fn(holeProxy);
  const holes: Hole[] = [];

  const template = document.createElement('template');
  template.innerHTML = renderToString(vnode, holes);

  return (props: Props = {}) => {
    const el = template.content.cloneNode(true) as DocumentFragment;
    for (let i = 0, j = holes.length; i < j; ++i) {
      const { hole, prop, pointer } = holes[i]!;

      if (prop) {
        const target = el.querySelector<HTMLElement>(`[${pointer}]`)!;
        const value = props[hole];
        target.removeAttribute(pointer);

        if (prop.startsWith('on')) {
          const event = prop.slice(2).toLowerCase();
          target.addEventListener(event, value);
        } else if (value !== undefined && value !== null) {
          if (
            target[prop] !== undefined &&
            target[prop] !== null &&
            !Reflect.has(target.style, prop) &&
            !(target instanceof SVGElement) &&
            prop in target
          ) {
            target[prop] = value;
          } else {
            target.setAttribute(prop, String(value));
          }
        }
      } else {
        el.getElementById(pointer)!.replaceWith(
          document.createTextNode(props[hole]),
        );
      }
    }
    return el.firstChild as HTMLElement;
  };
};
