import { IS_VOID_ELEMENT } from './constants';
import { childNodes$, createEventListener, insertText, replaceChild$, setAttribute } from './dom';
import { Block, Edit, EditType, Hole, VElement } from './types';

export const compileTemplate = (
  vnode: VElement,
  edits: Edit[] = [],
  path: number[] = [],
): string => {
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
    if (name === 'for') name = 'htmlFor';

    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
    if (name[0] === 'o' && name[1] === 'n') {
      const isValueHole = value instanceof Hole;
      current.edits.push({
        type: EditType.Event,
        listener: value,
        hole: isValueHole ? value : undefined,
        mount(el: HTMLElement, newValue?: any) {
          // Event listeners can be hole or function
          const event = createEventListener(
            el,
            name,
            isValueHole ? newValue : value,
          );
          event.mount();
          if (isValueHole) {
            this.patch = event.patch;
          }
        },
      });
      continue;
    }

    if (value instanceof Hole) {
      current.edits.push({
        type: EditType.Attribute,
        hole: value,
        mount(el: HTMLElement, newValue: any) {
          setAttribute(el, name, newValue);
        },
        patch(el: HTMLElement, newValue: any) {
          setAttribute(el, name, newValue);
        },
      });
      continue;
    }

    if (value) props += ` ${name}="${String(value)}"`;
  }

  if (IS_VOID_ELEMENT.test(vnode.tag)) return `<${vnode.tag}${props} />`;

  // 👎: 'foo' + Block + 'bar' => 'foobaz'.
  //                                      ↕️ Block edit here
  // 👍: 'foo' + Block + 'bar'   => 'foo', 'bar'
  let canMergeString = false;
  for (let i = 0, j = vnode.children?.length || 0, k = 0; i < j; ++i) {
    const child = vnode.children?.[i];
    if (!child) continue;

    if (child instanceof Hole) {
      current.edits.push({
        type: EditType.Child,
        hole: child,
        mount(el: HTMLElement, value: any) {
          insertText(el, value, i);
        },
        patch(el: HTMLElement, value: any) {
          const newNode = document.createTextNode(String(value));
          const oldNode = childNodes$.call(el)[i] as HTMLElement;

          replaceChild$.call(el, newNode, oldNode);
        },
      });
      continue;
    }

    if (child instanceof Block) {
      current.edits.push({
        type: EditType.Block,
        mount(el: HTMLElement) {
          child.mount(el, childNodes$.call(el)[i]);
        },
        patch(block: Block) {
          child.patch(block);
        },
      });
      continue;
    }

    if (typeof child === 'string') {
      if (canMergeString) {
        current.inits.push({
          type: EditType.Text,
          mount(el: HTMLElement) {
            insertText(el, child, i);
          },
        });
        continue;
      }
      canMergeString = true;
      children += child;
      k++;
      continue;
    }

    canMergeString = false;
    children += compileTemplate(child, edits, [...path, k++]);
  }

  if (current.inits.length || current.edits.length) {
    edits.push(current);
  }

  return `<${vnode.tag}${props}>${children}</${vnode.tag}>`;
};
