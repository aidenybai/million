import { describe, expect, it } from 'vitest';
import { parseSync } from '@babel/core';
import million from '../packages/compiler';

const BABEL_CONFIG = {
  plugins: ['@babel/plugin-syntax-jsx', million.babel],
};

describe('react-compiler', () => {
  it('should compile hooks', () => {
    const ast = parseSync(
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

  it('should compile objects', () => {
    const ast = parseSync(
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

  it('should compile derived values', () => {
    const ast = parseSync(
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

  it('should compile event listeners', () => {
    const ast = parseSync(
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

  it('should compile identifiers', () => {
    const ast = parseSync(
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
