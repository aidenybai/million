import { createElement } from '../createElement';
import { m } from '../m';
import { OLD_VNODE_FIELD } from '../types/base';

describe('.createElement', () => {
  it('should create Text', () => {
    expect(createElement('foo')).toEqual(document.createTextNode('foo'));
  });

  it('should create HTMLElement from vnode', () => {
    expect(createElement(m('div'))).toEqual(document.createElement('div') as HTMLElement);

    const el = document.createElement('div');
    el.id = 'app';
    el.appendChild(document.createTextNode('foo'));
    expect(createElement(m('div', { id: 'app' }, ['foo']))).toEqual(el);
  });

  it('should create HTMLElement from vnode with VNode child', () => {
    const el = document.createElement('div');
    el.id = 'app';
    const child = document.createElement('section');
    child.innerHTML = 'bar';
    child.id = 'foo';
    el.appendChild(child);

    expect(createElement(m('div', { id: 'app' }, [m('section', { id: 'foo' }, ['bar'])]))).toEqual(
      el,
    );
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
