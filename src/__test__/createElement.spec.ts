import { createElement } from '../createElement';
import { m, VNode, VProps } from '../m';
import { OLD_VNODE_FIELD } from '../patch';

const h = (tag: string, props?: VProps, ...children: VNode[]) =>
  m(
    tag,
    props,
    children.length ? children.flat().filter((child) => child !== undefined) : undefined,
  );

describe('.createElement', () => {
  it('should create Text', () => {
    expect(createElement('foo')).toEqual(document.createTextNode('foo'));
  });

  it('should create HTMLElement from vnode', () => {
    expect(createElement(h('div'))).toEqual(document.createElement('div') as HTMLElement);

    const created = createElement(h('div', { id: 'app' }, 'foo'));
    const manual = document.createElement('div') as HTMLElement;
    manual.id = 'app';
    manual.innerHTML = 'foo';

    expect(created).toEqual(manual);
  });

  it('should create HTMLElement from vnode', () => {
    expect(createElement(h('div'))).toEqual(<HTMLElement>document.createElement('div'));

    const created = createElement(h('div', { id: 'app' }, 'foo'));
    const manual = <HTMLElement>document.createElement('div');
    manual.id = 'app';
    manual.innerHTML = 'foo';

    expect(created).toEqual(manual);
  });

  it('should create HTMLElement from vnode', () => {
    expect(createElement(h('div'), true)[OLD_VNODE_FIELD]).toEqual(h('div'));
    expect(createElement(h('div'), false)[OLD_VNODE_FIELD]).toBeUndefined();
  });
});
