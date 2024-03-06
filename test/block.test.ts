import { describe, it } from 'vitest';
import { block as createBlock } from '../packages/million';
import type { MillionProps } from '../packages/types';
import type { VElement } from '../packages/million';

const fn = (props?: MillionProps): VElement => {
  return {
    type: 'div',
    props: {
      children: [
        {
          type: 'h1',
          props: {
            children: ['Hello'],
          },
        },
        ' World',
        {
          type: 'p',
          props: {
            title: 'baz',
            className: props?.bar,
            style: {
              margin: props?.zoo,
            },
            children: [props?.foo],
          },
        },
      ],
    },
  };
};

describe.concurrent('block', () => {
  it('should create reusable block', ({ expect }) => {
    const block = createBlock(fn);
    expect(block).toBeDefined();
    expect(block({ foo: 'foo', bar: 'bar', zoo: 1 })).toBeDefined();
  });
  it('should mount block', ({ expect }) => {
    const block = createBlock(fn);
    const main = block({ foo: 'foo', bar: 'bar', zoo: 1 });
    main.m();
    expect(main.l?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" style="margin: 1px;" class="bar">foo</p></div>',
    );
  });
  it('should patch block', ({ expect }) => {
    const block = createBlock(fn);
    const main = block({ foo: 'foo', bar: 'bar', zoo: 1 });
    main.m();
    main.p(block({ foo: 'bar', bar: 'foo', zoo: 1 }));
    expect(main.l?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" style="margin: 1px;" class="foo">bar</p></div>',
    );
    main.p(block({ foo: 'bar', bar: 'bar', zoo: 1 }));
    expect(main.l?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" style="margin: 1px;" class="bar">bar</p></div>',
    );
  });
  it('should patch nested blocks', ({ expect }) => {
    const block = createBlock(fn);
    const subBlock = createBlock(fn);
    const main = block({
      foo: subBlock({ foo: '1', bar: '2', zoo: 1 }),
      bar: 'bar',
      zoo: 1,
    });
    main.m();
    main.p(
      block({
        foo: subBlock({ foo: '2', bar: '1', zoo: 1 }),
        bar: 'bar',
        zoo: 1,
      }),
    );
    expect(main.l?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" style="margin: 1px;" class="bar"><div><h1>Hello</h1> World<p title="baz" style="margin: 1px;" class="1">2</p></div></p></div>',
    );
  });
  it('should remove block', ({ expect }) => {
    const block = createBlock(fn);
    const main = block({ foo: 'foo', bar: 'bar', zoo: 1 });
    main.m();
    main.x();
    expect(main.l).toBeNull();
  });
  it('should ignore null, undefined, false', ({ expect }) => {
    const block = createBlock(fn);
    const main = block({ foo: null, bar: 'bar', zoo: 1 });
    main.m();
    expect(main.l?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" style="margin: 1px;" class="bar"></p></div>',
    );
    main.p(block({ foo: undefined, bar: 'bar', zoo: 1 }));
    expect(main.l?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" style="margin: 1px;" class="bar"></p></div>',
    );
    main.p(block({ foo: false, bar: 'bar', zoo: '1px' }));
    expect(main.l?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" style="margin: 1px;" class="bar"></p></div>',
    );
  });
  it('should clear input inside block if the value is empty', ({ expect }) => {
    const block = createBlock((props?: MillionProps) => {
      return {
        type: 'div',
        props: {
          children: [
            {
              type: 'input',
              props: {
                value: props?.foo,
              },
            },
          ],
        },
      };
    });

    const main = block({ foo: 'foo' });

    main.m();
    expect(main.l?.outerHTML).toEqual('<div><input value="foo"></div>');

    main.p(block({ foo: '' }));

    expect(main.l?.outerHTML).toEqual('<div><input value=""></div>');
  });
});
