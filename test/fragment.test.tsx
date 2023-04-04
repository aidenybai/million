// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, expect, it } from 'vitest';
import { block as createBlock, fragment } from '../packages/million';
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
  it('should mount block', () => {
    const parent = document.createElement('div');
    const block = createBlock(fn);
    const frag = fragment([block({ foo: 'foo', bar: 'bar' })]);
    frag.m(parent);
    expect(frag.t()).toEqual(parent);
  });
  it('should patch block', () => {
    const parent = document.createElement('div');
    const block = createBlock(fn);
    const frag = fragment([block({ foo: 'foo', bar: 'bar' })]);
    frag.m(parent);
    frag.p(fragment([block({ foo: 'bar', bar: 'foo' })]));
    expect(frag.t()?.outerHTML).toEqual(
      '<div><div><h1>Hello</h1> World<p title="baz" class="foo">bar</p></div></div>',
    );
    frag.p(
      fragment([
        block({ foo: 'bar', bar: 'foo' }),
        block({ foo: 'bar', bar: 'foo' }),
      ]),
    );
    expect(frag.t()?.outerHTML).toEqual(
      '<div><div><h1>Hello</h1> World<p title="baz" class="foo">bar</p></div><div><h1>Hello</h1> World<p title="baz" class="foo">bar</p></div></div>',
    );
    frag.p(fragment([]));
    expect(frag.t()?.outerHTML).toEqual('<div></div>');
  });
  it('should remove fragment', () => {
    const parent = document.createElement('div');
    const block = createBlock(fn);
    const frag = fragment([block({ foo: 'foo', bar: 'bar' })]);
    frag.m(parent);
    frag.x();
    expect(frag.b).toEqual([]);
  });
});
