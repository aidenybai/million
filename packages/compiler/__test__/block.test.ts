import { vi } from 'vitest';
import { babelTransform } from './test-utils';

describe('block()', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => null);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('should transforms a valid block correctly', () => {
    const inputCode = `
        import { block } from "million/react";
        function Lion() {
            return (
                <img src="https://million.dev/lion.svg" />
            );
        }
        const LionBlock = block(Lion)
        `;
    const result = babelTransform(inputCode);
    expect(result.code).toMatchSnapshot();
  });

  it('should warns when an invalid block is used', () => {
    const inputCode = `
        import { block } from "million/react";
        console.log(block(<div />)); // ❌ Wrong
        `;
    babelTransform(inputCode);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '[Million.js] Found unsupported argument for block. Make sure blocks consume the reference to a component function, not the direct declaration.',
      ),
      '\n',
    );
  });
});
