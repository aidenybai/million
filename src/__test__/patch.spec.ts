import { createElement } from '../createElement';
import { m, VProps, VNode } from '../m';
import { patch } from '../patch';

const h = (tag: string, props?: VProps, ...children: VNode[]) =>
  m(
    tag,
    props,
    children.length ? children.flat().filter((child) => child !== undefined) : undefined,
  );

describe('.patch', () => {
  it('patches element and updates inner text content', () => {
    const el = createElement(h('div', { id: 'el' }, 'before content'));
    document.body.appendChild(el);

    expect(patch(el, h('div', { id: 'el' }, 'after content'))).toEqual(
      createElement(h('div', { id: 'el' }, 'after content')),
    );
    expect(document.querySelector('#el') as HTMLElement).toEqual(
      createElement(h('div', { id: 'el' }, 'after content')),
    );

    expect(patch(el, h('div', { id: 'el', className: 'new' }, 'new content'))).toEqual(
      createElement(h('div', { id: 'el', className: 'new' }, 'new content')),
    );
  });

  it('patches text', () => {
    const el = createElement('hello world');
    document.body.appendChild(el);

    expect(patch(el, 'goodbye world').textContent).toEqual('goodbye world');
  });

  it('patches props', () => {
    const child = h('div', { id: 'child' });
    const el = createElement(h('div', { id: 'el' }, child));

    document.body.appendChild(el);

    const manual = document.createElement('div');
    manual.id = 'el';
    const manualChild = document.createElement('div');
    manualChild.id = 'child';
    manualChild.innerHTML = 'Hello Child';

    manual.appendChild(manualChild);

    expect(patch(el, h('div', { id: 'el' }, h('div', { id: 'child' }, 'Hello Child')))).toEqual(
      manual,
    );
  });
});
