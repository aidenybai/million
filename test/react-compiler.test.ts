import { describe, it } from 'vitest';
import { parseAsync } from '@babel/core';
import million from '../packages/compiler';

const BABEL_CONFIG = {
  plugins: ['@babel/plugin-syntax-jsx', million.babel],
};

describe.concurrent('react-compiler', () => {
  it('should compile hooks', async ({ expect }) => {
    const ast = await parseAsync(
      `
        import React, { useState } from 'react';
        import { createRoot } from 'react-dom/client';
        import { block } from 'million/react';

        function Component({ initialCount }) {
          const [count, setCount] = useState(initialCount);

          return (
            <div>
              {greeting}
            </div>
          );
        }

        const ComponentBlock = block(Component);

        createRoot(document.getElementById('root')).render(
          <ComponentBlock initialCount={0} />
        );
      `,
      BABEL_CONFIG,
    );
    expect(ast).toMatchSnapshot();
  });

  it('should compile objects', async ({ expect }) => {
    const ast = await parseAsync(
      `
        import React, { useState } from 'react';
        import { createRoot } from 'react-dom/client';
        import { block } from 'million/react';

        function Component({ object }) {
          return (
            <div>
              {object.name}
            </div>
          );
        }

        const ComponentBlock = block(Component);

        createRoot(document.getElementById('root')).render(
          <ComponentBlock object={{ name: 'foo' }} />
        );
      `,
      BABEL_CONFIG,
    );
    expect(ast).toMatchSnapshot();
  });

  it('should compile derived values', async ({ expect }) => {
    const ast = await parseAsync(
      `
        import React, { useState } from 'react';
        import { createRoot } from 'react-dom/client';
        import { block } from 'million/react';

        function Component({ object }) {
          return (
            <div>
              {object.name + 'bar'}
            </div>
          );
        }

        const ComponentBlock = block(Component);

        createRoot(document.getElementById('root')).render(
          <ComponentBlock object={{ name: 'foo' }} />
        );
      `,
      BABEL_CONFIG,
    );
    expect(ast).toMatchSnapshot();
  });

  it('should compile event listeners', async ({ expect }) => {
    const ast = await parseAsync(
      `
        import React, { useState } from 'react';
        import { createRoot } from 'react-dom/client';
        import { block } from 'million/react';

        function Component() {
          return (
            <div onClick={() => alert(1)}>
              Alert
            </div>
          );
        }

        const ComponentBlock = block(Component);

        createRoot(document.getElementById('root')).render(
          <ComponentBlock />
        );
      `,
      BABEL_CONFIG,
    );
    expect(ast).toMatchSnapshot();
  });

  it('should compile identifiers', async ({ expect }) => {
    const ast = await parseAsync(
      `
        import React, { useState } from 'react';
        import { createRoot } from 'react-dom/client';
        import { block } from 'million/react';

        function Component() {
          const handleClick = () => alert(1);
          return (
            <div onClick={handleClick}>
              Alert
            </div>
          );
        }

        const ComponentBlock = block(Component);

        createRoot(document.getElementById('root')).render(
          <ComponentBlock />
        );
      `,
      BABEL_CONFIG,
    );
    expect(ast).toMatchSnapshot();
  });
});
