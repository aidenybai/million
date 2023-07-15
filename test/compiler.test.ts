import { vi } from 'vitest';
import { babelTransform } from './test-utils';

describe.concurrent('compiler', () => {
  describe.concurrent('block()', () => {
    let warnSpy;

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('should warns when an invalid block is used', () => {
      const inputCode = `
        import { block } from "million/react";
        console.log(block(<div />)); // ❌ Wrong
        `;
      babelTransform(inputCode);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[Million.js] Found unsupported argument for block.',
        ),
        expect.any(String),
      );
    });
  });
});
