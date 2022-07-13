import { describe, expect, it } from 'vitest';
import {
  className,
  Deltas,
  kebab,
  m,
  ns,
  style,
  svg,
} from '../packages/million/m';
import { DeltaTypes, Flags } from '../packages/million/types';
import type { VElement, VNode } from '../packages/million/types';

export const expectEqualVNode = (vnode1: VNode, vnode2: VNode) => {
  expect(JSON.stringify(vnode1)).toEqual(JSON.stringify(vnode2));
};

describe.concurrent('m', () => {
  it('should create empty vnode with tag', () => {
    expectEqualVNode(m('div'), { tag: 'div', flag: Flags.ELEMENT });
  });

  it('should create vnode with tag and props', () => {
    expectEqualVNode(m('div', { id: 'app' }), {
      tag: 'div',
      props: { id: 'app' },
      flag: Flags.ELEMENT,
    });
  });

  it('should create vnode with tag and one string child', () => {
    expectEqualVNode(m('div', undefined, ['foo']), {
      tag: 'div',
      children: ['foo'],
      flag: Flags.ELEMENT,
    });
  });

  it('should create vnode with tag and multiple string children', () => {
    expectEqualVNode(m('div', undefined, ['foo', 'bar', 'baz']), {
      tag: 'div',
      children: ['foo', 'bar', 'baz'],
      flag: Flags.ELEMENT,
    });
  });

  it('should create vnode with tag and one vnode child', () => {
    expectEqualVNode(m('div', undefined, [m('div')]), {
      tag: 'div',
      children: [
        {
          tag: 'div',
          flag: Flags.ELEMENT,
        },
      ],
      flag: Flags.ELEMENT,
    });
  });

  it('should create vnode with tag and multiple vnode and string children', () => {
    expectEqualVNode(m('div', undefined, [m('div'), 'foo', m('div'), 'bar']), {
      tag: 'div',
      children: [
        {
          tag: 'div',
          flag: Flags.ELEMENT,
        },
        'foo',
        {
          tag: 'div',
          flag: Flags.ELEMENT,
        },
        'bar',
      ],
      flag: Flags.ELEMENT,
    });
  });

  it('should create vnode with deeply nested children', () => {
    expectEqualVNode(
      m('div', undefined, [
        'foo',
        m('div', undefined, [
          'bar',
          m('div', undefined, ['baz', m('div', undefined, ['boo'])]),
        ]),
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
                    flag: Flags.ELEMENT,
                  },
                ],
                flag: Flags.ELEMENT,
              },
            ],
            flag: Flags.ELEMENT,
          },
        ],
        flag: Flags.ELEMENT,
      },
    );
  });

  it('should create a tag with className from class object', () => {
    expectEqualVNode(
      m('div', {
        className: className({ class1: true, class2: false, class3: true }),
      }),
      {
        tag: 'div',
        props: {
          className: 'class1 class3',
        },
        children: undefined,
        key: undefined,
        flag: Flags.ELEMENT,
      },
    );
  });

  it('should create a tag with style object', () => {
    expectEqualVNode(
      m('div', { style: style({ color: 'tomato', margin: '1rem' }) }),
      {
        tag: 'div',
        props: {
          style: 'color:tomato;margin:1rem',
        },
        children: undefined,
        key: undefined,
        flag: Flags.ELEMENT,
      },
    );
  });

  it('should create className from class object', () => {
    expect(className({ class1: true, class2: false, class3: true })).toEqual(
      'class1 class3',
    );
  });

  it('should create style from class object', () => {
    expect(
      style({ color: 'black', 'font-weight': 'bold', background: 'white' }),
    ).toEqual('color:black;font-weight:bold;background:white');
  });

  it('should attach ns to props with children with props', () => {
    const vnode: VElement = {
      tag: 'svg',
      props: {},
      children: [
        'foo',
        {
          tag: 'div',
          props: {},
          flag: Flags.ELEMENT,
        },
      ],
      flag: Flags.ELEMENT,
    };
    ns(vnode.tag, vnode.props!, vnode.children);
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
          flag: Flags.ELEMENT,
        },
      ],
      flag: Flags.ELEMENT,
    });
  });

  it('should attach ns to props with children without props', () => {
    const vnode: VElement = {
      tag: 'svg',
      props: {
        className: 'foo',
      },
      children: [
        'foo',
        {
          tag: 'div',
          flag: Flags.ELEMENT,
        },
      ],
      flag: Flags.ELEMENT,
    };
    ns(vnode.tag, vnode.props!, vnode.children);
    expectEqualVNode(vnode, {
      tag: 'svg',
      props: { class: 'foo', ns: 'http://www.w3.org/2000/svg' },
      children: [
        'foo',
        {
          tag: 'div',
          flag: Flags.ELEMENT,
        },
      ],
      flag: Flags.ELEMENT,
    });
  });

  it('should attach ns to props using svg helper', () => {
    const vnode: VElement = {
      tag: 'svg',
      flag: Flags.ELEMENT,
    };
    expectEqualVNode(svg(vnode), {
      tag: 'svg',
      flag: Flags.ELEMENT,
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
          flag: Flags.ELEMENT,
        },
      ],
      key: 'foo',
      flag: Flags.ELEMENT,
    });
  });

  it('should return delta operation when operation helper is used', () => {
    expect(Deltas.CREATE()).toEqual([DeltaTypes.CREATE, 0]);
    expect(Deltas.CREATE(5)).toEqual([DeltaTypes.CREATE, 5]);
    expect(Deltas.UPDATE()).toEqual([DeltaTypes.UPDATE, 0]);
    expect(Deltas.UPDATE(5)).toEqual([DeltaTypes.UPDATE, 5]);
    expect(Deltas.REMOVE()).toEqual([DeltaTypes.REMOVE, 0]);
    expect(Deltas.REMOVE(5)).toEqual([DeltaTypes.REMOVE, 5]);
  });

  it('should convert camelCase to kebab-case', () => {
    expect(kebab({ fooBarBaz: 'fooBarBaz' })).toEqual({
      'foo-bar-baz': 'fooBarBaz',
    });
    expect(kebab({ helloWorld: 'helloWorld' })).toEqual({
      'hello-world': 'helloWorld',
    });
    expect(kebab({ iHaveNumbers1: 'iHaveNumbers1' })).toEqual({
      'i-have-numbers1': 'iHaveNumbers1',
    });
  });
});
