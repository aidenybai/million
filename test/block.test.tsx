// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, expect, it } from 'vitest';
import { createBlock } from '../packages/million';
import type { Props, VElement } from '../packages/million';

const fn = (props?: Props): VElement => (
  <div>
    <h1>Hello</h1> World
    <p title="baz" className={props?.bar}>
      {props?.foo}
    </p>
  </div>
);

describe.concurrent('block', () => {
  it('should create reusable block', () => {
    const block = createBlock(fn);
    expect(block).toBeDefined();
    expect(block({ foo: 'foo', bar: 'bar' })).toBeDefined();
  });
  it('should mount block', () => {
    const block = createBlock(fn);
    const main = block({ foo: 'foo', bar: 'bar' });
    main.mount();
    expect(main.el?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" class="bar">foo</p></div>',
    );
  });
  it('should patch block', () => {
    const block = createBlock(fn);
    const main = block({ foo: 'foo', bar: 'bar' });
    main.mount();
    main.patch(block({ foo: 'bar', bar: 'foo' }));
    expect(main.el?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" class="foo">bar</p></div>',
    );
    main.patch(block({ foo: 'bar', bar: 'bar' }));
    expect(main.el?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" class="bar">bar</p></div>',
    );
  });
  it('should patch nested blocks', () => {
    const block = createBlock(fn);
    const subBlock = createBlock(fn);
    const main = block({ foo: subBlock({ foo: '1', bar: '2' }), bar: 'bar' });
    main.mount();
    main.patch(block({ foo: subBlock({ foo: '2', bar: '1' }), bar: 'bar' }));
    expect(main.el?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" class="bar"><div><h1>Hello</h1> World<p title="baz" class="1">2</p></div></p></div>',
    );
  });
  it('should remove block', () => {
    const block = createBlock(fn);
    const main = block({ foo: 'foo', bar: 'bar' });
    main.mount();
    main.remove();
    expect(main.el).toBeUndefined();
  });
});
