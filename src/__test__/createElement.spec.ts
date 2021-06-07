// import { _ } from '../index';
import { m } from '../m';
import { createElement } from '../createElement';

describe('.createElement', () => {
  it('creates text element', () => {
    expect(createElement('hello')).toEqual(document.createTextNode('hello'));
  });

  it('creates HTMLElement from vNode', () => {
    expect(createElement(m('div'))).toEqual(document.createElement('div') as HTMLElement);

    let created = createElement(m('div', { id: 't' }, ['test element']));
    let manual = document.createElement('div') as HTMLElement;
    manual.id = 't';
    manual.innerHTML = 'test element';

    expect(created).toEqual(manual);
  })
});
