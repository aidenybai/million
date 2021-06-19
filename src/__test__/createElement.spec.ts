import { createElement } from '../createElement';
import { OLD_VNODE_FIELD } from '../constants';
import { m } from '../m';
import { VNode, VProps } from '../structs';

const createManual = (tag: string, props: unknown) => Object.assign(document.createElement(tag), props);

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
    const manual = createManual('div', { id: 'app', innerHTML: 'foo' }) as HTMLElement;

    expect(created).toEqual(manual);
  });

  it('should create HTMLElement from vnode', () => {
    expect(createElement(h('div'))).toEqual(<HTMLElement>document.createElement('div'));

    const created = createElement(h('div', { id: 'app' }, 'foo'));
    const manual = <HTMLElement>createManual('div', { id: 'app', innerHTML: 'foo' });

    expect(created).toEqual(manual);
  });

  it('should create HTMLElement from vnode with VNode child', () => {
    const child = h('section', { id: 'child' }, 'bar');
    const created = createElement(h('div', { id: 'app' }, child));

    const mCreated = <HTMLElement>createManual('div', { id: 'app' });
    const mChild = <HTMLElement>createManual('section', { id: 'child', innerHTML: 'bar' });

    mCreated.append(mChild);
    expect(created).toEqual(mCreated);
  });

  it('should create HTMLElement from vnode', () => {
    expect(createElement(h('div'), true)[OLD_VNODE_FIELD]).toEqual(h('div'));
    expect(createElement(h('div'), false)[OLD_VNODE_FIELD]).toBeUndefined();
  });
});
