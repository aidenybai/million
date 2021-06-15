import { createElement } from '../createElement';
import { m } from '../m';
import { patch, patchChildren, patchProps } from '../patch';
import { VNode, VProps } from '../structs';

const h = (tag: string, props?: VProps, ...children: VNode[]) =>
  m(
    tag,
    props,
    children.length ? children.flat().filter((child) => child !== undefined) : undefined,
  );

describe('.patch', () => {
  it('should patch element with text as children', () => {
    const el = createElement(h('div', { id: 'el' }, 'foo'));
    document.body.appendChild(el);

    expect(patch(el, h('div', { id: 'el' }, 'bar'))).toEqual(
      createElement(h('div', { id: 'el' }, 'bar')),
    );
    expect(<HTMLElement>document.querySelector('#el')).toEqual(
      createElement(h('div', { id: 'el' }, 'bar')),
    );
    expect(patch(el, h('div', { id: 'el', class: 'new' }, 'baz'))).toEqual(
      createElement(h('div', { id: 'el', class: 'new' }, 'baz')),
    );

    document.body.textContent = '';
  });

  it('should patch text', () => {
    const el = createElement('foo');
    document.body.appendChild(el);

    expect(patch(el, 'bar').textContent).toEqual('bar');
  });

  it('should remove textContent if no children', () => {
    const el = createElement('foo');
    document.body.appendChild(el);
    el.textContent = 'foo';

    expect(patch(el, m('div', undefined, undefined, 0)).textContent).toEqual('');
  });

  it('should patch props', () => {
    const el = document.createElement('div');
    el.id = 'app';

    patchProps(<HTMLElement>el, { id: 'app' }, { title: 'bar', id: 'app' });

    expect(el.id).toEqual('app');
    expect(el.title).toEqual('bar');

    patchProps(<HTMLElement>el, { title: 'bar', id: 'app' });

    expect(el.id).toEqual('');
    expect(el.title).toEqual('');
  });

  it('should keep old props and add new ones', () => {
    const el = document.createElement('div');
    el.id = 'app';

    patchProps(<HTMLElement>el, { id: 'app' }, { title: 'bar', id: 'app' });

    expect(el.id).toEqual('app');
    expect(el.title).toEqual('bar');

    patchProps(
      <HTMLElement>el,
      { title: 'bar', id: 'app' },
      { title: 'foo', id: 'app1', lang: 'pt', hidden: true },
    );

    expect(el.id).toEqual('app1');
    expect(el.lang).toEqual('pt');
    expect(el.title).toEqual('foo');
    expect(el.hidden).toEqual(true);
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
});
