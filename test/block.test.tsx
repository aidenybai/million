// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/restrict-template-expressions */
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, it } from 'vitest';
import { block as createBlock } from '../packages/million';
import type { Props, VElement } from '../packages/million';

const fn = (props?: Props): VElement => (
  <div>
    <h1>Hello</h1> World
    <p title="baz" className={props?.bar}>
      {props?.foo}
    </p>
  </div>
);

const styleFn = (props?: Props): VElement => (
  <div>
    <h1 className={`${props?.bar}_color`}>Hello</h1> World
    <p style={{ [props?.foo]: props?.bar }}>{`${props?.zoo}abc`}</p>
  </div>
);

describe.concurrent('block', () => {
  it('should create reusable block', ({ expect }) => {
    const block = createBlock(fn);
    expect(block).toBeDefined();
    expect(block({ foo: 'foo', bar: 'bar' })).toBeDefined();
  });
  it('should mount block', ({ expect }) => {
    const block = createBlock(fn);
    const main = block({ foo: 'foo', bar: 'bar' });
    main.m();
    expect(main.l?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" class="bar">foo</p></div>',
    );
  });
  it('should patch block', ({ expect }) => {
    const block = createBlock(fn);
    const main = block({ foo: 'foo', bar: 'bar' });
    main.m();
    main.p(block({ foo: 'bar', bar: 'foo' }));
    expect(main.l?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" class="foo">bar</p></div>',
    );
    main.p(block({ foo: 'bar', bar: 'bar' }));
    expect(main.l?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" class="bar">bar</p></div>',
    );
  });
  it('should patch nested blocks', ({ expect }) => {
    const block = createBlock(fn);
    const subBlock = createBlock(fn);
    const main = block({ foo: subBlock({ foo: '1', bar: '2' }), bar: 'bar' });
    main.m();
    main.p(block({ foo: subBlock({ foo: '2', bar: '1' }), bar: 'bar' }));
    expect(main.l?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" class="bar"><div><h1>Hello</h1> World<p title="baz" class="1">2</p></div></p></div>',
    );
  });
  it('should remove block', ({ expect }) => {
    const block = createBlock(fn);
    const main = block({ foo: 'foo', bar: 'bar' });
    main.m();
    main.x();
    expect(main.l).toBeNull();
  });
  it('should ignore null, undefined, false', ({ expect }) => {
    const block = createBlock(fn);
    const main = block({ foo: null, bar: 'bar' });
    main.m();
    expect(main.l?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" class="bar"></p></div>',
    );
    main.p(block({ foo: undefined, bar: 'bar' }));
    expect(main.l?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" class="bar"></p></div>',
    );
    main.p(block({ foo: false, bar: 'bar' }));
    expect(main.l?.outerHTML).toEqual(
      '<div><h1>Hello</h1> World<p title="baz" class="bar"></p></div>',
    );
  });
  it('should patch style', ({ expect }) => {
    const block = createBlock(styleFn);
    const main = block({ foo: 'backgroundColor', bar: 'red', zoo: 'zoo' });
    main.m();
    expect(main.l?.outerHTML).toEqual(
      '<div><h1 class="red_color">Hello</h1> World<p style="background-color: red;">zooabc</p></div>',
    );
    main.p(block({ foo: 'background', bar: 'blue', zoo: 'bazz' }));
    expect(main.l?.outerHTML).toEqual(
      '<div><h1 class="blue_color">Hello</h1> World<p style="background: blue;">bazzabc</p></div>',
    );
  });
});
