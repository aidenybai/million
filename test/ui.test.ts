// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, it } from 'vitest';
import { block as createBlock } from '../packages/million';
import type { MillionProps } from '../packages/types';
import type { VElement } from '../packages/million';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const fn = (props?: MillionProps): VElement => {
  return {
    type: Box.toString(),
    props: {
      children: [
        {
          type: Skeleton.toString(),
          props: {},
        },
        {
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
        },
      ],
      sx: {
        width: 300,
      },
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
      '<div class="MuiBox-root css-1v5z18m"><span class="MuiSkeleton-root MuiSkeleton-text MuiSkeleton-pulse css-1n7gpw1-MuiSkeleton-root"></span><span class="MuiSkeleton-root MuiSkeleton-text MuiSkeleton-wave css-1etr2k8-MuiSkeleton-root"></span><span class="MuiSkeleton-root MuiSkeleton-text css-1l6af8c-MuiSkeleton-root"></span><div><h1>Hello</h1> World<p title="baz" style="margin: 1px;" class="bar">foo</p></div></div>',
    );
  });
  it('should patch block', ({ expect }) => {
    const block = createBlock(fn);
    const main = block({ foo: 'foo', bar: 'bar', zoo: 1 });
    main.m();
    main.p(block({ foo: 'bar', bar: 'foo', zoo: 1 }));
    expect(main.l?.outerHTML).toEqual(
      '<div class="MuiBox-root css-1v5z18m"><span class="MuiSkeleton-root MuiSkeleton-text MuiSkeleton-pulse css-1n7gpw1-MuiSkeleton-root"></span><span class="MuiSkeleton-root MuiSkeleton-text MuiSkeleton-wave css-1etr2k8-MuiSkeleton-root"></span><span class="MuiSkeleton-root MuiSkeleton-text css-1l6af8c-MuiSkeleton-root"></span><div><h1>Hello</h1> World<p title="baz" style="margin: 1px;" class="foo">bar</p></div></div>',
    );
    main.p(block({ foo: 'bar', bar: 'bar', zoo: 1 }));
    expect(main.l?.outerHTML).toEqual(
      '<div class="MuiBox-root css-1v5z18m"><span class="MuiSkeleton-root MuiSkeleton-text MuiSkeleton-pulse css-1n7gpw1-MuiSkeleton-root"></span><span class="MuiSkeleton-root MuiSkeleton-text MuiSkeleton-wave css-1etr2k8-MuiSkeleton-root"></span><span class="MuiSkeleton-root MuiSkeleton-text css-1l6af8c-MuiSkeleton-root"></span><div><h1>Hello</h1> World<p title="baz" style="margin: 1px;" class="bar">bar</p></div></div>',
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
      '<div class="MuiBox-root css-1v5z18m"><span class="MuiSkeleton-root MuiSkeleton-text MuiSkeleton-pulse css-1n7gpw1-MuiSkeleton-root"></span><span class="MuiSkeleton-root MuiSkeleton-text MuiSkeleton-wave css-1etr2k8-MuiSkeleton-root"></span><span class="MuiSkeleton-root MuiSkeleton-text css-1l6af8c-MuiSkeleton-root"></span><div><h1>Hello</h1> World<p title="baz" style="margin: 1px;" class="bar"><div><h1>Hello</h1> World<p title="baz" style="margin: 1px;" class="1">2</p></div></p></div></div>',
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
      '<div class="MuiBox-root css-1v5z18m"><span class="MuiSkeleton-root MuiSkeleton-text MuiSkeleton-pulse css-1n7gpw1-MuiSkeleton-root"></span><span class="MuiSkeleton-root MuiSkeleton-text MuiSkeleton-wave css-1etr2k8-MuiSkeleton-root"></span><span class="MuiSkeleton-root MuiSkeleton-text css-1l6af8c-MuiSkeleton-root"></span><div><h1>Hello</h1> World<p title="baz" style="margin: 1px;" class="bar"></p></div></div>',
    );
    main.p(block({ foo: undefined, bar: 'bar', zoo: 1 }));
    expect(main.l?.outerHTML).toEqual(
      '<div class="MuiBox-root css-1v5z18m"><span class="MuiSkeleton-root MuiSkeleton-text MuiSkeleton-pulse css-1n7gpw1-MuiSkeleton-root"></span><span class="MuiSkeleton-root MuiSkeleton-text MuiSkeleton-wave css-1etr2k8-MuiSkeleton-root"></span><span class="MuiSkeleton-root MuiSkeleton-text css-1l6af8c-MuiSkeleton-root"></span><div><h1>Hello</h1> World<p title="baz" style="margin: 1px;" class="bar"></p></div></div>',
    );
    main.p(block({ foo: false, bar: 'bar', zoo: '1px' }));
    expect(main.l?.outerHTML).toEqual(
      '<div class="MuiBox-root css-1v5z18m"><span class="MuiSkeleton-root MuiSkeleton-text MuiSkeleton-pulse css-1n7gpw1-MuiSkeleton-root"></span><span class="MuiSkeleton-root MuiSkeleton-text MuiSkeleton-wave css-1etr2k8-MuiSkeleton-root"></span><span class="MuiSkeleton-root MuiSkeleton-text css-1l6af8c-MuiSkeleton-root"></span><div><h1>Hello</h1> World<p title="baz" style="margin: 1px;" class="bar"></p></div></div>',
    );
  });
});
