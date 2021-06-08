import { createElement } from '../createElement';
import { m } from '../m';
import { patch } from '../patch';

describe('.patch', () => {
  it('patches element and updates inner text content', () => {
    const el = createElement(m('div', { id: 'el' }, ['before content']));
    document.body.appendChild(el);

    expect(patch(el, m('div', { id: 'el' }, ['after content']))).toEqual(
      createElement(m('div', { id: 'el' }, ['after content'])),
    );
    expect(document.querySelector('#el') as HTMLElement).toEqual(
      createElement(m('div', { id: 'el' }, ['after content'])),
    );

    expect(patch(el, m('div', { id: 'el', className: 'new' }, ['new content']))).toEqual(
      createElement(m('div', { id: 'el', className: 'new' }, ['new content'])),
    );
  });

  it('patches text', () => {
    const el = createElement('hello world');
    document.body.appendChild(el);

    expect(patch(el, 'goodbye world').textContent).toEqual('goodbye world');
  });

  it('patches props', () => {
    const child = m('div', { id: 'child' });
    const el = createElement(m('div', { id: 'el' }, [child]));

    document.body.appendChild(el);

    const manual = document.createElement('div');
    manual.id = 'el';
    const manualChild = document.createElement('div');
    manualChild.id = 'child';
    manualChild.innerHTML = 'Hello Child';

    manual.appendChild(manualChild);

    expect(patch(el, m('div', { id: 'el' }, [m('div', { id: 'child' }, ['Hello Child'])]))).toEqual(
      manual,
    );
  });
});
