import { describe, expect, it } from 'vitest';
import { createElement } from '../src/createElement';
import { entity, m } from '../src/m';
import { DOMNode, OLD_VNODE_FIELD } from '../src/types/base';

export const expectEqualNode = (el1: DOMNode, el2: DOMNode) => {
  expect(el1.isEqualNode(el2)).toBeTruthy();
};

describe.concurrent('createElement', () => {
  it('should create Text', () => {
    expectEqualNode(createElement('foo'), document.createTextNode('foo'));
  });

  it('should create HTMLElement from vnode', () => {
    expectEqualNode(createElement(m('div')), document.createElement('div') as HTMLElement);

    const el = document.createElement('div');
    el.id = 'app';
    el.appendChild(document.createTextNode('foo'));
    expectEqualNode(createElement(m('div', { id: 'app' }, ['foo'])), el);
  });

  it('should create HTMLElement from vnode with VNode child', () => {
    const el = document.createElement('div');
    el.id = 'app';
    const child = document.createElement('section');
    child.innerHTML = 'bar';
    child.id = 'foo';
    el.appendChild(child);

    expectEqualNode(
      createElement(m('div', { id: 'app' }, [m('section', { id: 'foo' }, ['bar'])])),
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

  it('should create event listener', () => {
    const el = document.createElement('div');
    el.addEventListener('click', () => undefined);
    expect(createElement(m('div', { onclick: () => undefined }))).toBeTruthy();
  });

  it('should resolve entity', () => {
    expectEqualNode(createElement(entity({}, () => m('div'))), createElement(m('div')));
  });

  it('should create empty comment', () => {
    const el = document.createComment('');
    expectEqualNode(createElement(null), el);
  });
});
