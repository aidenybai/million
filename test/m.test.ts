import { describe, expect, it } from 'vitest';
import { className, Delta, kebab, m, ns, style, svg, toVNode } from '../src/m';
import { DeltaTypes, OLD_VNODE_FIELD, VNode } from '../src/types/base';

const expectEqualVNode = (vnode1: VNode, vnode2: VNode) => {
  expect(JSON.stringify(vnode1)).toEqual(JSON.stringify(vnode2));
};

describe.concurrent('m', () => {
  it('should create empty vnode with tag', () => {
    expectEqualVNode(m('div'), { tag: 'div' });
  });

  it('should create vnode with tag and props', () => {
    expectEqualVNode(m('div', { id: 'app' }), { tag: 'div', props: { id: 'app' } });
  });

  it('should create vnode with tag and one string child', () => {
    expectEqualVNode(m('div', undefined, ['foo']), { tag: 'div', children: ['foo'] });
  });

  it('should create vnode with tag and multiple string children', () => {
    expectEqualVNode(m('div', undefined, ['foo', 'bar', 'baz']), {
      tag: 'div',
      children: ['foo', 'bar', 'baz'],
    });
  });

  it('should create vnode with tag and one vnode child', () => {
    expectEqualVNode(m('div', undefined, [m('div')]), {
      tag: 'div',
      children: [
        {
          tag: 'div',
        },
      ],
    });
  });

  it('should create vnode with tag and multiple vnode and string children', () => {
    expectEqualVNode(m('div', undefined, [m('div'), 'foo', m('div'), 'bar']), {
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
    expectEqualVNode(
      m('div', undefined, [
        'foo',
        m('div', undefined, ['bar', m('div', undefined, ['baz', m('div', undefined, ['boo'])])]),
      ]),
      {
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
      },
    );
  });

  it('should create a tag with className from class object', () => {
    expectEqualVNode(
      m('div', { className: className({ class1: true, class2: false, class3: true }) }),
      {
        tag: 'div',
        props: {
          className: 'class1 class3',
        },
        children: undefined,
        key: undefined,
      },
    );
  });

  it('should create a tag with style object', () => {
    expectEqualVNode(m('div', { style: style({ color: 'tomato', margin: '1rem' }) }), {
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
    expectEqualVNode(vnode, {
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
    expectEqualVNode(vnode, {
      tag: 'svg',
      props: { class: 'foo', ns: 'http://www.w3.org/2000/svg' },
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
    };
    expectEqualVNode(svg(vnode), {
      tag: 'svg',
      props: { ns: 'http://www.w3.org/2000/svg' },
    });
  });

  it('should move key to distinct property', () => {
    expectEqualVNode(m('div', { key: 'foo' }, ['foo', m('div')]), {
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
    expect(Delta.INSERT()).toEqual([DeltaTypes.INSERT, 0]);
    expect(Delta.INSERT(5)).toEqual([DeltaTypes.INSERT, 5]);
    expect(Delta.UPDATE()).toEqual([DeltaTypes.UPDATE, 0]);
    expect(Delta.UPDATE(5)).toEqual([DeltaTypes.UPDATE, 5]);
    expect(Delta.DELETE()).toEqual([DeltaTypes.DELETE, 0]);
    expect(Delta.DELETE(5)).toEqual([DeltaTypes.DELETE, 5]);
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

    expectEqualVNode(
      toVNode(el),
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

    expectEqualVNode(
      toVNode(el),
      m('DIV', { id: 'foo', class: 'bar baz', style: 'color: red;' }, [
        m('A', { href: 'http://foo.bar' }, ['foo bar baz']),
      ]),
    );

    it('should convert HTML string to VNode', () => {
      expectEqualVNode(
        toVNode(
          '<div id="foo" class="bar baz" style="color: red; "><a href="http://foo.bar">foo bar baz</a></div>',
        ),
        m('DIV', { id: 'foo', class: 'bar baz', style: 'color: red;' }, [
          m('A', { href: 'http://foo.bar' }, ['foo bar baz']),
        ]),
      );
    });
  });
});
