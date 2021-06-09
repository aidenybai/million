import { createElement } from '../createElement';
import { m } from '../m';

describe('.createElement', () => {
  it('should create Text', () => {
    expect(createElement('foo')).toEqual(document.createTextNode('foo'));
  });

  it('should create HTMLElement from vnode', () => {
    expect(createElement(m('div'))).toEqual(document.createElement('div') as HTMLElement);

    const created = createElement(m('div', { id: 'app' }, 'foo'));
    const manual = document.createElement('div') as HTMLElement;
    manual.id = 'app';
    manual.innerHTML = 'foo';

    expect(created).toEqual(manual);
  });
});
