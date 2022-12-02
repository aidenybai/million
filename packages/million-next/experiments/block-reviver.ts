// slow

import { IS_VOID_ELEMENT } from '../constants';
import type { Edit, Props, VElement, VNode } from '../types';

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

const setAttribute = (
  el: HTMLElement,
  name: string,
  value?: string | null | EventListener,
) => {
  if (name.startsWith('on')) {
    const event = name.slice(2).toLowerCase() as keyof HTMLElementEventMap;
    el.addEventListener(event, value as EventListener);
  } else if (value !== undefined && value !== null) {
    if (
      el[name] !== undefined &&
      el[name] !== null &&
      !Reflect.has(el.style, name) &&
      !(el instanceof SVGElement) &&
      name in el
    ) {
      el[name] = value;
    } else {
      el.setAttribute(name, String(value));
    }
  }
};

const insertText = (el: HTMLElement, value: unknown, index: number) => {
  el.insertBefore(
    document.createTextNode(String(value)),
    el.childNodes[index] as HTMLElement,
  );
};

export const block = (fn: (props?: Props) => VElement) => {
  const vnode = fn(holeProxy);
  const edits: Edit[] = [];

  const template = document.createElement('template');
  template.innerHTML = renderToTemplate(vnode, edits, []);

  let editsStringified = '';

  for (let i = 0, j = edits.length; i < j; ++i) {
    const current = edits[i]!;
    let el = 'root';
    for (let k = 0, l = current.path.length; k < l; ++k) {
      el += `.childNodes[${current.path[k]!}]`;
    }

    for (let k = 0, l = current.edits.length; k < l; ++k) {
      const edit = current.edits[k]!;

      if (edit.type === 'attribute') {
        editsStringified += `this.setAttribute(${el}, '${edit.name}', props.${edit.hole});
        `;
      }
      if (edit.type === 'insert') {
        editsStringified += `this.insertText(${el}, String(props.${edit.hole}), ${edit.index});
        `;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const rootFn = new Function(
    'root',
    'props',
    `${editsStringified}return root;`,
  );
  const reviver = rootFn.bind({ setAttribute, insertText });

  return (props: Props = {}): HTMLElement => {
    const root = template.content.cloneNode(true) as DocumentFragment;

    return reviver(root.firstChild, props);
  };
};
