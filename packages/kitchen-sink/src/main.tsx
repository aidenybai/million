import {
  version,
  StrictMode,
  useState,
  type ComponentType,
  lazy,
  Suspense,
  LazyExoticComponent,
} from 'react';
import './style.css';
import { ErrorBoundary } from 'react-error-boundary';

type Module = { default: ComponentType<any> };

(async () => {
  let createRootElement;
  if (version.startsWith('18')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createRoot } = await import('react-dom/client');
    createRootElement = createRoot;
  } else {
    const ReactDOM = await import('react-dom');
    createRootElement = ReactDOM.render;
  }
  const modules = await Promise.all(
    Object.entries(import.meta.glob('./examples/*.{tsx,jsx}')).map(
      async ([key, mod]) =>
        [
          key
            .replace('./examples/', '')
            .replace('.tsx', '')
            .replace('.jsx', ''),
          mod as () => Promise<Module>,
        ] as const,
    ),
  );
  const loadedModules: LazyExoticComponent<ComponentType<any>>[] = [];

  function App() {
    const [selected, setSelected] = useState<number>(-1);
    const hasSelected = selected >= 0;

    const Mod = hasSelected ? loadedModules[selected]! : null;

    return (
      <div>
        <h1>Million.js Kitchen Sink</h1>
        <p>
          Hey! We're actively recruiting cooks 🧑‍🍳 to help assemble a list of
          examples of Million + your favorite React library. Go to{' '}
          <a href="https://million.dev/kitchen-sink">
            million.dev/kitchen-sink
          </a>{' '}
          for details.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          {modules.map(([key], index) => {
            return (
              <button
                onClick={async () => {
                  setSelected(index);
                  loadedModules[index] = lazy(() => modules[index]![1]());
                }}
                key={key}
                disabled={hasSelected && selected === index}
              >
                {key
                  .replace('./examples/', '')
                  .replace('.tsx', '')
                  .replace('.jsx', '')}
              </button>
            );
          })}{' '}
        </div>
        <details open={hasSelected}>
          <summary>
            Currently Selected:{' '}
            <strong>{hasSelected ? modules[selected]![0] : 'None'}</strong>
          </summary>
          <div style={{ padding: '1rem' }}>
            <ErrorBoundary
              fallbackRender={({ error }) => (
                <div
                  style={{
                    color: '#ff8080',
                    background: '#290000',
                    padding: '1rem',
                    borderRadius: '1rem',
                  }}
                >
                  <h2>💥 {error.message}</h2>
                  <pre>{error.stack}</pre>
                </div>
              )}
            >
              {hasSelected && Mod && (
                <Suspense
                  fallback={
                    <div
                      style={{
                        opacity: 0.5,
                      }}
                    >
                      <p className="spinner"></p>
                      Loading module...
                    </div>
                  }
                >
                  <Mod />
                </Suspense>
              )}
            </ErrorBoundary>
          </div>
        </details>
      </div>
    );
  }

  version.startsWith('18')
    ? createRootElement(document.getElementById('root')!).render(
        <StrictMode>
          <App />
        </StrictMode>,
      )
    : createRootElement(
        <StrictMode>
          <App />
        </StrictMode>,
        document.getElementById('root')!,
      );
})();
