import { describe, it } from 'vitest';
import { parseAsync } from '@babel/core';
import million from '../packages/compiler';

const BABEL_CONFIG = {
  plugins: ['@babel/plugin-syntax-jsx', million.babel],
};

describe('preact-compiler', () => {
  it('should compile hooks', async ({ expect }) => {
    const ast = await parseAsync(
      `
      import { h, render } from 'preact';
      import { useState } from 'preact/hooks';
      import { block } from 'million/preact';


      function Component({ initialCount }) {
        const [count, setCount] = useState(initialCount);

        return (
          <div>
            {greeting}
          </div>
        );
      }

      const ComponentBlock = block(Component);

      render(
        <ComponentBlock initialCount={0} />,
        document.getElementById('root')
      );

      `,
      BABEL_CONFIG,
    );
    expect(ast).toMatchSnapshot();
  });

  it('should compile objects', async ({ expect }) => {
    const ast = await parseAsync(
      `
      import { h, render } from 'preact';
      import { block } from 'million/preact';

      function Component({ object }) {
        return (
          <div>
            {object.name}
          </div>
        );
      }

      const ComponentBlock = block(Component);

      render(
        <ComponentBlock object={{ name: 'foo' }} />,
        document.getElementById('root')
      );
      `,
      BABEL_CONFIG,
    );
    expect(ast).toMatchSnapshot();
  });

  it('should compile derived values', async ({ expect }) => {
    const ast = await parseAsync(
      `
      import { h, render } from 'preact';
      import { block } from 'million/preact';

      function Component({ object }) {
        return (
          <div>
            {object.name + 'bar'}
          </div>
        );
      }

      const ComponentBlock = block(Component);

      render(
        <ComponentBlock object={{ name: 'foo' }} />,
        document.getElementById('root')
      );
      `,
      BABEL_CONFIG,
    );
    expect(ast).toMatchSnapshot();
  });

  it('should compile event listeners', async ({ expect }) => {
    const ast = await parseAsync(
      `
      import { h, render } from 'preact';
      import { block } from 'million/preact';

     function Component() {
        return (
        <div onClick={() => alert(1)}>
          Alert
        </div>
        );
     }

     const ComponentBlock = block(Component);

     render(
        <ComponentBlock />,
        document.getElementById('root')
     );

    `,
      BABEL_CONFIG,
    );
    expect(ast).toMatchSnapshot();
  });

  it('should compile identifiers', async ({ expect }) => {
    const ast = await parseAsync(
      `
      import { h, render } from 'preact';
      import { block } from 'million/preact';

      function Component() {
        const handleClick = () => alert(1);
        return (
          <div onClick={handleClick}>
            Alert
          </div>
        );
      }

      const ComponentBlock = block(Component);

      render(
        <ComponentBlock />,
        document.getElementById('root')
      );
      `,
      BABEL_CONFIG,
    );
    expect(ast).toMatchSnapshot();
  });
});
