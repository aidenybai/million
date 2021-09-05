import { createElement } from '../createElement';
import { DELETE, INSERT, m, UPDATE } from '../m';
import { patch } from '../patch';
import { VFlags } from '../structs';

describe('.patch', () => {
  it('should patch element with text as children', () => {
    const el = createElement(m('div', { id: 'el' }, ['foo']));

    patch(el, m('div', { id: 'el' }, ['bar']));
    expect(el).toEqual(createElement(m('div', { id: 'el' }, ['bar'])));
    patch(el, m('div', { id: 'el', className: 'foo' }, ['baz']));
    expect(el).toEqual(createElement(m('div', { id: 'el', className: 'foo' }, ['baz'])));

    document.body.textContent = '';
  });

  it('should patch attributes', () => {
    const el = createElement(m('div', { id: 'el' }, ['foo']));

    patch(el, m('div', { 'data-test': 'foo' }, ['bar']));
    expect(el).toEqual(createElement(m('div', { 'data-test': 'foo' }, ['bar'])));

    document.body.textContent = '';
  });

  it('should patch text', () => {
    const el = createElement('foo');
    document.body.appendChild(el);
    patch(el, 'bar', 'foo');
    expect(document.body.firstChild?.nodeValue).toEqual('bar');
    document.body.textContent = '';
  });

  it('should remove textContent if no children', () => {
    const el = createElement(m('div'));

    el.textContent = 'foo';

    patch(el, m('div', undefined, undefined, 0));

    expect(el.textContent).toEqual('');
  });

  // Deltas are behaving weird because they are "delayed" patching
  it('should execute INSERT deltas', () => {
    const el = document.createElement('div');
    const children: string[] = [];
    const createVNode = () => m('div', undefined, [...children], undefined, [INSERT(0)]);

    const prevVNode1 = createVNode();
    children.unshift('foo');
    patch(el, createVNode(), prevVNode1);
    expect(el.childNodes.length).toEqual(1);

    const prevVNode2 = createVNode();
    children.unshift('bar');
    patch(el, createVNode(), prevVNode2);
    expect(el.childNodes.length).toEqual(2);

    const prevVNode3 = createVNode();
    children.unshift('baz');
    patch(el, createVNode(), prevVNode3);
    expect(el.childNodes.length).toEqual(3);
  });

  it('should execute UPDATE deltas', () => {
    const el = document.createElement('div');
    el.textContent = 'foo';
    const children: string[] = ['foo'];
    const createVNode = () => m('div', undefined, [...children], undefined, [UPDATE(0)]);

    const prevVNode1 = createVNode();
    children[0] = 'bar';
    patch(el, createVNode(), prevVNode1);
    expect(el.textContent).toEqual('bar');

    const prevVNode2 = createVNode();
    children[0] = 'baz';
    patch(el, createVNode(), prevVNode2);
    expect(el.textContent).toEqual('baz');
  });

  it('should execute INSERT deltas', () => {
    const el = document.createElement('div');
    const children: string[] = [];
    const createVNode = () => m('div', undefined, [...children], undefined, [INSERT(0)]);

    const prevVNode1 = createVNode();
    children.unshift('bar');
    patch(el, createVNode(), prevVNode1);
    expect(el.childNodes.length).toEqual(1);

    const prevVNode2 = createVNode();
    children.unshift('baz');
    patch(el, createVNode(), prevVNode2);
    expect(el.childNodes.length).toEqual(2);
  });

  it('should execute DELETE deltas', () => {
    const el = document.createElement('div');
    el.appendChild(document.createTextNode('foo'));
    el.appendChild(document.createTextNode('bar'));
    el.appendChild(document.createTextNode('baz'));
    const children: string[] = ['foo', 'bar', 'baz'];
    const createVNode = () => m('div', undefined, [...children], undefined, [DELETE(0)]);

    const prevVNode1 = createVNode();
    children.splice(0, 1);
    patch(el, createVNode(), prevVNode1);
    expect(el.firstChild!.nodeValue).toEqual('bar');

    const prevVNode2 = createVNode();
    children.splice(0, 1);
    patch(el, createVNode(), prevVNode2);
    expect(el.firstChild!.nodeValue).toEqual('baz');
  });

  it('should shortcut if flags are present', () => {
    const el = document.createElement('div');
    patch(
      el,
      m('div', undefined, ['foo'], VFlags.ONLY_TEXT_CHILDREN),
      m('div', undefined, [], VFlags.ONLY_TEXT_CHILDREN),
    );
    expect(el.textContent).toEqual('foo');

    patch(
      el,
      m('div', undefined, [], VFlags.NO_CHILDREN),
      m('div', undefined, ['foo'], VFlags.NO_CHILDREN),
    );
    expect(el.childNodes.length).toEqual(0);
  });

  it('should used keyed algorithm when flag is passed', () => {
    const el = document.createElement('ul');
    const list1 = ['foo', 'bar', 'baz'];
    const newVNode1 = m(
      'ul',
      undefined,
      list1.map((item) => m('li', { key: item }, [item])),
      VFlags.ONLY_KEYED_CHILDREN,
    );
    patch(el, newVNode1, m('ul', undefined, undefined, VFlags.NO_CHILDREN));
    expect(el).toEqual(createElement(newVNode1));

    const list2 = ['foo', 'baz', 'bar'];
    const newVNode2 = m(
      'ul',
      undefined,
      list2.map((item) => m('li', { key: item }, [item])),
      VFlags.ONLY_KEYED_CHILDREN,
    );
    patch(el, newVNode2, newVNode1);
    expect(el).toEqual(createElement(newVNode2));

    const list3 = ['foo0', 'foo', 'bar', 'baz', 'foo1', 'bar1', 'baz1'];
    const newVNode3 = m(
      'ul',
      undefined,
      list3.map((item) => m('li', { key: item }, [item])),
      VFlags.ONLY_KEYED_CHILDREN,
    );
    patch(el, newVNode3, newVNode2);
    expect(el).toEqual(createElement(newVNode3));

    const list4 = list3.reverse();
    const newVNode4 = m(
      'ul',
      undefined,
      list4.map((item) => m('li', { key: item }, [item])),
      VFlags.ONLY_KEYED_CHILDREN,
    );
    patch(el, newVNode4, newVNode3);
    expect(el).toEqual(createElement(newVNode4));
  });
});
