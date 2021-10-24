import { createElement } from '../createElement';
import { m } from '../m';
import { OLD_VNODE_FIELD } from '../types';

const fakeMFunction = (tag: string, props: unknown) =>
  Object.assign(document.createElement(tag), props);

describe('.createElement', () => {
  it('should create Text', () => {
    expect(createElement('foo')).toEqual(document.createTextNode('foo'));
  });

  it('should create HTMLElement from vnode', () => {
    expect(createElement(m('div'))).toEqual(document.createElement('div') as HTMLElement);

    const created = createElement(m('div', { id: 'app' }, ['foo']));
    const manual = fakeMFunction('div', { id: 'app', innerHTML: 'foo' }) as HTMLElement;

    expect(created).toEqual(manual);
  });

  it('should create HTMLElement from vnode', () => {
    expect(createElement(m('div'))).toEqual(<HTMLElement>document.createElement('div'));

    const created = createElement(m('div', { id: 'app' }, ['foo']));
    const manual = <HTMLElement>fakeMFunction('div', { id: 'app', innerHTML: 'foo' });

    expect(created).toEqual(manual);
  });

  it('should create HTMLElement from vnode with VNode child', () => {
    const child = m('section', { id: 'child' }, ['bar']);
    const created = createElement(m('div', { id: 'app' }, [child]));

    const mCreated = <HTMLElement>fakeMFunction('div', { id: 'app' });
    const mChild = <HTMLElement>fakeMFunction('section', { id: 'child', innerHTML: 'bar' });

    mCreated.append(mChild);
    expect(created).toEqual(mCreated);
  });

  it('should create HTMLElement from vnode', () => {
    expect(createElement(m('div'), true)[OLD_VNODE_FIELD]).toEqual(m('div'));
    expect(createElement(m('div'), false)[OLD_VNODE_FIELD]).toBeUndefined();
  });

  it('should createElementNS when svg', () => {
    const svg = <HTMLElement>createElement(m('svg', { ns: 'http://www.w3.org/2000/svg' }));
    expect(svg.namespaceURI).toEqual('http://www.w3.org/2000/svg');
    expect(svg instanceof SVGElement).toBeTruthy();
  });
});
