import { type SandpackFiles } from '@codesandbox/sandpack-react';

export const files: SandpackFiles = {
  '/vite.config.js': {
    code: `import million from 'million/compiler';
    import react from '@vitejs/plugin-react';

        import { defineConfig } from 'vite';
         
        export default defineConfig({
          plugins: [million.vite(), react()],
        });`,
    readOnly: true,
  },
  '/App.jsx': {
    code: `
import { useState } from 'react';
import { block } from 'million/react';
      
export function App() {
  const [count, setCount] = useState(0);
    const handleClick = () => {
      setCount(count + 1);
    };

  return <button onClick={handleClick}>{count}</button>;
}
    
  const AppBlock = block(App);
  export default AppBlock;
    `,
  },
};
