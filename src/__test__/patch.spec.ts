import { createElement } from '../createElement';
import { m, INSERT, UPDATE, DELETE } from '../m';
import { patch, patchChildren, patchProps } from '../patch';
import { VFlags, VNode, VProps } from '../structs';

const h = (tag: string, props?: VProps, ...children: VNode[]) =>
  m(
    tag,
    props,
    children.length ? children.flat().filter((child) => child !== undefined) : undefined,
  );

describe('.patch', () => {
  it('should patch element with text as children', () => {
    const el = createElement(h('div', { id: 'el' }, 'foo'));

    expect(patch(el, h('div', { id: 'el' }, 'bar'))).toEqual(
      createElement(h('div', { id: 'el' }, 'bar')),
    );
    expect(el).toEqual(createElement(h('div', { id: 'el' }, 'bar')));
    expect(patch(el, h('div', { id: 'el', class: 'new' }, 'baz'))).toEqual(
      createElement(h('div', { id: 'el', class: 'new' }, 'baz')),
    );

    document.body.textContent = '';
  });

  it('should patch text', () => {
    const el = createElement('foo');

    expect(patch(el, 'bar', 'foo').nodeValue).toEqual('bar');
  });

  it('should remove textContent if no children', () => {
    const el = createElement('foo');

    el.textContent = 'foo';

    expect(patch(el, m('div', undefined, undefined, 0)).textContent).toEqual('');
  });

  it('should patch props', () => {
    const el = document.createElement('div');
    el.id = 'app';

    patchProps(<HTMLElement>el, { id: 'app' }, { title: 'bar', id: 'app' });

    expect(el.id).toEqual('app');
    expect(el.title).toEqual('bar');

    patchProps(<HTMLElement>el, { title: 'bar', id: 'app' }, {});

    expect(el.id).toEqual('');
    expect(el.title).toEqual('');
  });

  it('should keep old props and add new ones', () => {
    const el = document.createElement('div');
    const props = { title: 'bar', id: 'app', hidden: false };
    el.id = 'app';

    patchProps(<HTMLDivElement>el, { id: 'app' }, props);

    expect(el.id).toEqual('app');
    expect(el.title).toEqual('bar');
    expect(el.hidden).toEqual(false);

    const func = () => void 0;

    el.lang = 'pt';
    el.spellcheck = true;

    patchProps(
      <HTMLDivElement>el,
      { ...props, lang: 'pt', spellcheck: true },
      { ...props, id: 'new-app', hidden: true, translate: false, onclick: func },
    );

    expect(el.id).toEqual('new-app'); // updated
    expect(el.lang).toBeFalsy(); // removed
    expect(el.title).toEqual('bar'); // keeped
    expect(el.hidden).toEqual(true); // updated
    expect(el.translate).toEqual(false); // created
    expect(el.spellcheck).toBeFalsy(); // removed
    expect(typeof el.onclick).toBe('function'); // created
  });

  it('should patch children', () => {
    const virtualArrayToDOMNodes = (children: (string | VNode)[]): (HTMLElement | Text)[] =>
      children.map((child: string | VNode) => createElement(child));
    const el = document.createElement('div');
    (<Text[]>virtualArrayToDOMNodes(['foo', 'bar', 'baz'])).forEach((textNode: Text) => {
      el.appendChild(textNode);
    });
    patchChildren(<HTMLElement>el, ['foo', 'bar', 'baz'], ['foo']);

    expect([...el.childNodes]).toEqual(virtualArrayToDOMNodes(['foo']));

    patchChildren(<HTMLElement>el, ['foo'], ['foo', 'bar', 'baz']);

    expect([...el.childNodes]).toEqual(virtualArrayToDOMNodes(['foo', 'bar', 'baz']));
    patchChildren(<HTMLElement>el, ['foo', 'bar', 'baz'], ['foo', m('div'), 'baz']);

    expect([...el.childNodes]).toEqual(virtualArrayToDOMNodes(['foo', m('div'), 'baz']));
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
});
