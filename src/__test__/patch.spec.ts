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
});
