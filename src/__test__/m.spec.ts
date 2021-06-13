import { _ } from '../index';
import { className, m, ns, style, VProps, VNode } from '../m';

const h = (tag: string, props?: VProps, ...children: VNode[]) =>
  m(
    tag,
    props,
    children.length ? children.flat().filter((child) => child !== undefined) : undefined,
  );

describe('.m', () => {
  it('should create empty vnode with tag', () => {
    expect(h('div')).toEqual({ tag: 'div' });
  });

  it('should create vnode with tag and props', () => {
    expect(h('div', { id: 'app' })).toEqual({ tag: 'div', props: { id: 'app' } });
  });

  it('should create vnode with tag and one string child', () => {
    expect(h('div', _, 'foo')).toEqual({ tag: 'div', children: ['foo'] });
  });

  it('should create vnode with tag and multiple string children', () => {
    expect(h('div', _, 'foo', 'bar', 'baz')).toEqual({
      tag: 'div',
      children: ['foo', 'bar', 'baz'],
    });
  });

  it('should create vnode with tag and one vnode child', () => {
    expect(h('div', _, h('div'))).toEqual({
      tag: 'div',
      children: [
        {
          tag: 'div',
        },
      ],
    });
  });

  it('should create vnode with tag and multiple vnode and string children', () => {
    expect(h('div', _, h('div'), 'foo', h('div'), 'bar')).toEqual({
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
    expect(h('div', _, 'foo', h('div', _, 'bar', h('div', _, 'baz', h('div', _, 'boo'))))).toEqual({
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
      props: {},
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
    expect(h('div', { key: 'foo' }, 'foo', h('div'))).toEqual({
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
});
