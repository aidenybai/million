import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from '@codesandbox/sandpack-react';
import dedent from 'dedent';
import { useDarkMode } from './use-dark-mode';

export function Box({
  code,
  previewOnly,
}: {
  code: string;
  previewOnly: boolean | undefined;
}) {
  const isDarkMode = useDarkMode();
  return (
    <SandpackProvider
      theme={isDarkMode ? 'dark' : 'light'}
      template="vite-react"
      customSetup={{
        dependencies: {
          vite: '3.2.3',
          million: '2.3.3',
          '@vitejs/plugin-react': 'latest',
          'react-lag-radar': 'latest',
        },
      }}
      files={{
        'App.jsx': dedent`${code.trim()}`,
        'data.jsx': {
          code: dedent`const adjectives = ['pretty', 'large', 'big', 'small', 'tall', 'short', 'long', 'handsome', 'plain', 'quaint', 'clean', 'elegant', 'easy', 'angry', 'crazy', 'helpful', 'mushy', 'odd', 'unsightly', 'adorable', 'important', 'inexpensive', 'cheap', 'expensive', 'fancy'];
        const colors = ['red', 'yellow', 'blue', 'green', 'pink', 'brown', 'purple', 'brown', 'white', 'black', 'orange'];
        const nouns = ['table', 'chair', 'house', 'bbq', 'desk', 'car', 'pony', 'cookie', 'sandwich', 'burger', 'pizza', 'mouse', 'keyboard'];

        const random = (max) => Math.round(Math.random() * 1000) % max;
        export const buildData = (rows) => {
          const data = [];
          for (let i = 0; i < rows; i++) {
            data.push({
              adjective: getAdjective(),
              noun: getNoun(),
              color: getColor(),
            });
          }
          return data;
        }

        export const getAdjective = () => adjectives[random(adjectives.length)];
        export const getColor = () => colors[random(colors.length)];
        export const getNoun = () => nouns[random(nouns.length)];`,
          hidden: true,
        },
        'ui.jsx': {
          code: dedent`
          import { useRef } from 'react';
          import LagRadar from 'react-lag-radar';

          export const Table = ({ children, showRadar }) => (
            <>
              {showRadar && <LagRadar />}
              <table>
                <thead>
                  <tr>
                    <th>Adjective</th>
                    <th>Noun</th>
                    <th>Color</th>
                  </tr>
                </thead>
                <tbody>
                  {children}
                </tbody>
              </table>
            </>
          );

          export const Input = ({ value, setValue }) => {
            const inputRef = useRef();
            const handleInput = () => {
              const newValue = Number(inputRef.current.value);

              if (!isNaN(newValue) && newValue >= 0 && newValue <= 9999) {
                setValue(Number(inputRef.current.value))
              }
            }
            return (
              <input
                type="number"
                ref={inputRef}
                value={value}
                onChange={handleInput}
              />
            );
          };

          export const lotsOfElements = Array(100).fill(0).map((_, i) => <div><div><div></div></div><div><div></div></div></div>);
          `,
          hidden: true,
        },
        'vite.config.js': {
          code: dedent`
            import react from '@vitejs/plugin-react';
            import million from 'million/compiler';
            import { defineConfig } from 'vite';

            export default defineConfig({
              plugins: [million.vite(), react()],
            });
          `,
          readOnly: true,
        },
      }}
    >
      {!previewOnly && (
        <>
          <div
            className="mt-6 flex px-2 ltr:pr-4 rtl:pl-4 bg-black/[.03] dark:bg-gray-50/10 dark:text-neutral-500"
            style={{
              marginBottom: -1,
              position: 'relative',
              zIndex: 9,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderBottom: 0,
            }}
          >
            <div className="min-w-0">
              <p className="text-gray-500 mt-6 leading-7 first:mt-0 flex">
                <svg
                  className="mr-2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  width="18"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m8 17.95-6-6L8.05 5.9l1.075 1.075L4.15 11.95l4.925 4.925L8 17.95Zm7.95.05-1.075-1.075 4.975-4.975-4.925-4.925L16 5.95l6 6L15.95 18Z"
                    fill="currentColor"
                  />
                </svg>
                Editable example
              </p>
            </div>
          </div>
          <SandpackLayout className="sandpack-fluid-layout">
            <SandpackCodeEditor wrapContent showTabs showLineNumbers />
          </SandpackLayout>
        </>
      )}

      <div
        className="mt-4 flex px-2 ltr:pr-4 rtl:pl-4 bg-black/[.03] dark:bg-gray-50/10 dark:text-neutral-500"
        style={{
          marginBottom: -1,
          position: 'relative',
          zIndex: 9,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          borderBottom: 0,
        }}
      >
        <div className="min-w-0">
          <p className="text-gray-500 mt-6 leading-7 first:mt-0  flex">
            <svg
              className="mr-2 text-gray-400"
              fill="currentColor"
              viewBox="0 0 48 48"
              width="18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16 37.85v-28l22 14Zm3-14Zm0 8.55 13.45-8.55L19 15.3Z" />
            </svg>
            Preview
          </p>
        </div>
      </div>
      <SandpackLayout>
        <SandpackPreview
          showOpenInCodeSandbox={false}
          showRefreshButton={false}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
}
