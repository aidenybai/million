import { describe, expect, it } from 'vitest';
import { parseSync } from '@babel/core';
import million from '../packages/compiler';


const BABEL_CONFIG = {
  plugins: ['@babel/plugin-syntax-jsx', million.babel],
};


describe('preact-compiler', () => {
  it('should compile hooks', () => {
    const ast = parseSync(
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

  it('should compile objects', () => {
    const ast = parseSync(
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

  it('should compile derived values', () => {
    const ast = parseSync(
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

  it('should compile event listeners', () => {
    const ast = parseSync(
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

  it('should compile identifiers', () => {
    const ast = parseSync(
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
