import { describe, it } from 'vitest';
import type { VElement } from '../packages/million';
import { block as createBlock } from '../packages/million';
import type { MillionProps } from '../packages/types';

const fn = (props?: MillionProps): VElement => {
  return {
    type: 'div',
    props: {
      children: [
        {
          type: 'svg',
          props: {
            className: props?.bar,
            strokeWidth: 1,
            children: [
              {
                type: 'path',
                props: {
                  d: 'M9 12l2 2 4-4',
                  strikethroughThickness: props.thickness,
                },
              },
            ],
          },
        },
      ],
    },
  };
};

describe.concurrent('block', () => {
  it('should resolve alias', ({ expect }) => {
    const block = createBlock(fn);
    const main = block({ bar: 'bar', thickness: 2 });
    main.m();
    expect(main.l?.outerHTML).toEqual(
      '<div><svg stroke-width="1" class="bar"><path d="M9 12l2 2 4-4" strikethrough-thickness="2"></path></svg></div>',
    );
  });
});
