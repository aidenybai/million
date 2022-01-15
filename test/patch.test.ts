import { describe, expect, it } from 'vitest';
import { createElement } from '../src/createElement';
import { useChildren } from '../src/drivers/useChildren';
import { useNode } from '../src/drivers/useNode';
import { useProps } from '../src/drivers/useProps';
import { Delta, entity, m } from '../src/m';
import { patch } from '../src/patch';
import { DOMNode, Flags } from '../src/types/base';

const expectEqualNode = (el1: DOMNode, el2: DOMNode) => {
  expect(el1.isEqualNode(el2)).toBeTruthy();
};

describe.concurrent('patch', () => {
  it('should patch element with text as children', () => {
    const el = createElement(m('div', { id: 'el' }, ['foo']));

    patch(el, m('div', { id: 'el' }, ['bar']));
    expectEqualNode(el, createElement(m('div', { id: 'el' }, ['bar'])));
    patch(el, m('div', { id: 'el', className: 'foo' }, ['baz']));
    expectEqualNode(el, createElement(m('div', { id: 'el', className: 'foo' }, ['baz'])));
  });

  it('should patch attributes', () => {
    const el = createElement(m('div', { id: 'el' }, ['foo']));

    patch(el, m('div', { 'data-test': 'foo' }, ['bar']));
    expectEqualNode(el, createElement(m('div', { 'data-test': 'foo' }, ['bar'])));
  });

  it('should patch text', () => {
    const el = createElement('foo');
    document.body.appendChild(el);
    patch(el, 'bar', 'foo');
    expect(document.body.firstChild?.nodeValue).toEqual('bar');
    document.body.textContent = '';
  });

  it('should remove text', () => {
    const el = createElement('foo');
    document.body.appendChild(el);
    patch(el, undefined, 'foo');
    expect(document.body.firstChild?.nodeValue).toEqual(undefined);
    document.body.textContent = '';
  });

  it('should remove textContent if no children', () => {
    const el = createElement(m('div'));

    el.textContent = 'foo';

    patch(el, m('div', undefined, undefined, Flags.NO_CHILDREN));

    expect(el.textContent).toEqual('');
  });

  // Deltas are behaving weird because they are "delayed" patching
  it('should execute INSERT deltas', () => {
    const el = document.createElement('div');
    const children: string[] = [];
    const createVNode = () => m('div', undefined, [...children], undefined, [Delta.INSERT(0)]);

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
    const createVNode = () => m('div', undefined, [...children], undefined, [Delta.UPDATE(0)]);

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
    const createVNode = () => m('div', undefined, [...children], undefined, [Delta.INSERT(0)]);

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
    const createVNode = () => m('div', undefined, [...children], undefined, [Delta.DELETE(0)]);

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
      m('div', undefined, ['foo'], Flags.ONLY_TEXT_CHILDREN),
      m('div', undefined, [], Flags.ONLY_TEXT_CHILDREN),
    );
    expect(el.textContent).toEqual('foo');

    patch(
      el,
      m('div', undefined, [], Flags.NO_CHILDREN),
      m('div', undefined, ['foo'], Flags.NO_CHILDREN),
    );
    expect(el.childNodes.length).toEqual(0);
  });

  it('should used keyed algorithm when flag is passed', () => {
    const el = document.createElement('ul');
    const list1 = ['foo', 'bar', 'baz', 'foo1', 'bar1', 'baz1'];
    const newVNode1 = m(
      'ul',
      undefined,
      list1.map((item) => m('li', { key: item }, [item])),
      Flags.ONLY_KEYED_CHILDREN,
    );
    patch(el, newVNode1, m('ul', undefined, undefined, Flags.NO_CHILDREN));
    expectEqualNode(el, createElement(newVNode1));

    const list2 = ['foo', 'baz', 'bar', 'foo1', 'bar1', 'baz1'];
    const newVNode2 = m(
      'ul',
      undefined,
      list2.map((item) => m('li', { key: item }, [item])),
      Flags.ONLY_KEYED_CHILDREN,
    );
    patch(el, newVNode2, newVNode1);
    expectEqualNode(el, createElement(newVNode2));

    const list3 = ['baz1', 'baz', 'bar', 'foo1', 'bar1', 'foo'];
    const newVNode3 = m(
      'ul',
      undefined,
      list3.map((item) => m('li', { key: item }, [item])),
      Flags.ONLY_KEYED_CHILDREN,
    );
    patch(el, newVNode3, newVNode2);
    expectEqualNode(el, createElement(newVNode3));

    const list4 = ['baz1', 'baz', 'foo1', 'bar', 'bar1', 'foo'];
    const newVNode4 = m(
      'ul',
      undefined,
      list4.map((item) => m('li', { key: item }, [item])),
      Flags.ONLY_KEYED_CHILDREN,
    );
    patch(el, newVNode4, newVNode3);
    expectEqualNode(el, createElement(newVNode4));

    const list5 = ['baz1', 'baz', 'bar1', 'foo'];
    const newVNode5 = m(
      'ul',
      undefined,
      list5.map((item) => m('li', { key: item }, [item])),
      Flags.ONLY_KEYED_CHILDREN,
    );
    patch(el, newVNode5, newVNode4);
    expectEqualNode(el, createElement(newVNode5));

    const list6 = ['baz1', 'foo1', 'bar', 'foo'];
    const newVNode6 = m(
      'ul',
      undefined,
      list6.map((item) => m('li', { key: item }, [item])),
      Flags.ONLY_KEYED_CHILDREN,
    );
    patch(el, newVNode6, newVNode5);
    expectEqualNode(el, createElement(newVNode6));

    const list7 = ['baz1', 'foo1', 'bar', 'foo'].reverse();
    const newVNode7 = m(
      'ul',
      undefined,
      list7.map((item) => m('li', { key: item }, [item])),
      Flags.ONLY_KEYED_CHILDREN,
    );
    patch(el, newVNode7, newVNode6);
    expectEqualNode(el, createElement(newVNode7));
  });

  it('should return new DOM node', () => {
    const el1 = createElement(m('div'));
    const el2 = patch(el1, m('div', { id: 'app' }));

    expect((<HTMLElement>el2).id).toEqual('app');
    expectEqualNode(<HTMLElement>el2, el1);
  });

  it('should compose a custom patch', () => {
    const el1 = createElement(m('div'));
    const diff = useNode([useProps(), useChildren()]);
    const data = diff(el1, m('div', { id: 'app' }));

    for (let i = 0; i < data.effects!.length; i++) {
      data.effects![i]();
    }

    expect((<HTMLElement>data.el).id).toEqual('app');
    expectEqualNode(<HTMLElement>data.el, el1);
  });

  it('should hard replace if different tag', () => {
    const el1 = createElement(m('div'));
    const el2 = patch(el1, m('a'));

    expectEqualNode(el2, document.createElement('a'));
  });

  it('should create entity', () => {
    const el = createElement(entity({}, () => m('div')));

    expectEqualNode(el, document.createElement('div'));
  });

  it('should patch entity', () => {
    const data = { local: 0 };
    const entity1 = entity(data, () => {
      data.local++;
      return m('a');
    });
    const el1 = createElement(entity({}, () => m('div')));
    const el2 = patch(el1, entity1);

    expectEqualNode(el2, document.createElement('a'));
    expect(entity1.data.local).toEqual(1);
  });
});
