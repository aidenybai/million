import { m } from '../m';
import { createElement } from '../createElement';

describe('.createElement', () => {
  it('should create Text', () => {
    expect(createElement('hello')).toEqual(document.createTextNode('hello'));
  });

  it('should create HTMLElement from vnode', () => {
    expect(createElement(m('div'))).toEqual(document.createElement('div') as HTMLElement);

    const created = createElement(m('div', { id: 'app' }, ['foo']));
    const manual = document.createElement('div') as HTMLElement;
    manual.id = 'app';
    manual.innerHTML = 'foo';

    expect(created).toEqual(manual);
  })
});
