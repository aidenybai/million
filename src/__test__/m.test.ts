import { className, DELETE, INSERT, kebab, m, ns, style, svg, UPDATE, toVNode } from '../m';
import { OLD_VNODE_FIELD, VDeltaOperationTypes } from '../types/base';

describe('.m', () => {
  it('should create empty vnode with tag', () => {
    expect(m('div')).toEqual({ tag: 'div' });
  });

  it('should create vnode with tag and props', () => {
    expect(m('div', { id: 'app' })).toEqual({ tag: 'div', props: { id: 'app' } });
  });

  it('should create vnode with tag and one string child', () => {
    expect(m('div', undefined, ['foo'])).toEqual({ tag: 'div', children: ['foo'] });
  });

  it('should create vnode with tag and multiple string children', () => {
    expect(m('div', undefined, ['foo', 'bar', 'baz'])).toEqual({
      tag: 'div',
      children: ['foo', 'bar', 'baz'],
    });
  });

  it('should create vnode with tag and one vnode child', () => {
    expect(m('div', undefined, [m('div')])).toEqual({
      tag: 'div',
      children: [
        {
          tag: 'div',
        },
      ],
    });
  });

  it('should create vnode with tag and multiple vnode and string children', () => {
    expect(m('div', undefined, [m('div'), 'foo', m('div'), 'bar'])).toEqual({
      tag: 'div',
      children: [
        {
          tag: 'div',
        },
        'foo',
        {
          tag: 'div',
        },
        'bar',
      ],
    });
  });

  it('should create vnode with deeply nested children', () => {
    expect(
      m('div', undefined, [
        'foo',
        m('div', undefined, ['bar', m('div', undefined, ['baz', m('div', undefined, ['boo'])])]),
      ]),
    ).toEqual({
      tag: 'div',
      children: [
        'foo',
        {
          tag: 'div',
          children: [
            'bar',
            {
              tag: 'div',
              children: [
                'baz',
                {
                  tag: 'div',
                  children: ['boo'],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('should create a tag with className from class object', () => {
    expect(
      m('div', { className: className({ class1: true, class2: false, class3: true }) }),
    ).toEqual({
      tag: 'div',
      props: {
        className: 'class1 class3',
      },
      children: undefined,
      key: undefined,
    });
  });

  it('should create a tag with style object', () => {
    expect(m('div', { style: style({ color: 'tomato', margin: '1rem' }) })).toEqual({
      tag: 'div',
      props: {
        style: 'color:tomato;margin:1rem',
      },
      children: undefined,
      key: undefined,
    });
  });

  it('should create className from class object', () => {
    expect(className({ class1: true, class2: false, class3: true })).toEqual('class1 class3');
  });

  it('should create style from class object', () => {
    expect(style({ color: 'black', 'font-weight': 'bold', background: 'white' })).toEqual(
      'color:black;font-weight:bold;background:white',
    );
  });

  it('should attach ns to props with children with props', () => {
    const vnode = {
      tag: 'svg',
      props: {},
      children: [
        'foo',
        {
          tag: 'div',
          props: {},
        },
      ],
    };
    ns(vnode.tag, vnode.props, vnode.children);
    expect(vnode).toEqual({
      tag: 'svg',
      props: { ns: 'http://www.w3.org/2000/svg' },
      children: [
        'foo',
        {
          tag: 'div',
          props: {
            ns: 'http://www.w3.org/2000/svg',
          },
        },
      ],
    });
  });

  it('should attach ns to props with children without props', () => {
    const vnode = {
      tag: 'svg',
      props: {
        className: 'foo',
      },
      children: [
        'foo',
        {
          tag: 'div',
        },
      ],
    };
    ns(vnode.tag, vnode.props, vnode.children);
    expect(vnode).toEqual({
      tag: 'svg',
      props: { ns: 'http://www.w3.org/2000/svg', class: 'foo' },
      children: [
        'foo',
        {
          tag: 'div',
        },
      ],
    });
  });

  it('should attach ns to props using svg helper', () => {
    const vnode = {
      tag: 'svg',
      children: [
        'foo',
        {
          tag: 'div',
        },
      ],
    };
    expect(svg(vnode)).toEqual({
      tag: 'svg',
      props: { ns: 'http://www.w3.org/2000/svg' },
      children: [
        'foo',
        {
          tag: 'div',
        },
      ],
    });
  });

  it('should move key to distinct property', () => {
    expect(m('div', { key: 'foo' }, ['foo', m('div')])).toEqual({
      tag: 'div',
      props: {},
      children: [
        'foo',
        {
          tag: 'div',
        },
      ],
      key: 'foo',
    });
  });

  it('should return delta operation when operation helper is used', () => {
    expect(INSERT()).toEqual([VDeltaOperationTypes.INSERT, 0]);
    expect(INSERT(5)).toEqual([VDeltaOperationTypes.INSERT, 5]);
    expect(UPDATE()).toEqual([VDeltaOperationTypes.UPDATE, 0]);
    expect(UPDATE(5)).toEqual([VDeltaOperationTypes.UPDATE, 5]);
    expect(DELETE()).toEqual([VDeltaOperationTypes.DELETE, 0]);
    expect(DELETE(5)).toEqual([VDeltaOperationTypes.DELETE, 5]);
  });

  it('should convert camelCase to kebab-case', () => {
    expect(kebab({ fooBarBaz: 'fooBarBaz' })).toEqual({ 'foo-bar-baz': 'fooBarBaz' });
    expect(kebab({ helloWorld: 'helloWorld' })).toEqual({ 'hello-world': 'helloWorld' });
    expect(kebab({ iHaveNumbers1: 'iHaveNumbers1' })).toEqual({
      'i-have-numbers1': 'iHaveNumbers1',
    });
  });

  it('should convert real HTMLElement to VNode', () => {
    const el = document.createElement('div');
    const child = document.createElement('a');
    el.id = 'foo';
    el.className = 'bar baz';
    el.style.color = 'red';
    child.textContent = 'foo bar baz';
    child.href = 'http://foo.bar';
    el.appendChild(child);

    expect(toVNode(el)).toEqual(
      m('DIV', { id: 'foo', class: 'bar baz', style: 'color: red;' }, [
        m('A', { href: 'http://foo.bar' }, ['foo bar baz']),
      ]),
    );
  });

  it('should convert real HTMLElement to VNode with OLD_VNODE_FIELD', () => {
    const el = document.createElement('div');
    const child = document.createElement('a');
    el.id = 'foo';
    el.className = 'bar baz';
    el.style.color = 'red';
    child.textContent = 'foo bar baz';
    child.href = 'http://foo.bar';
    el.appendChild(child);

    el[OLD_VNODE_FIELD] = m('DIV', { id: 'foo', class: 'bar baz', style: 'color: red;' }, [
      m('A', { href: 'http://foo.bar' }, ['foo bar baz']),
    ]);

    expect(toVNode(el)).toEqual(
      m('DIV', { id: 'foo', class: 'bar baz', style: 'color: red;' }, [
        m('A', { href: 'http://foo.bar' }, ['foo bar baz']),
      ]),
    );
  });
});
