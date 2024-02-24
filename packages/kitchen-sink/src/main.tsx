import {
  useState,
  type ComponentType,
  lazy,
  Suspense,
  LazyExoticComponent,
  useEffect,
} from 'react';
import './css/style.css';
import './css/examples/style.css';
import { ErrorBoundary } from 'react-error-boundary';
import { RxHamburgerMenu } from 'react-icons/rx';
import { AiOutlineClose } from 'react-icons/ai';
import { createRoot } from 'react-dom/client';

type Module = { default: ComponentType<any> };

(async () => {
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
    const [selected, setSelected] = useState<number>(() => {
      const index = +window.location.pathname.split('/')[1] ?? -1;

      loadedModules[index] = lazy(() => modules[index]![1]());
      return index;
    });

    const [sidebarOpened, setSidebarOpened] = useState(false);

    const [isMobile, setIsMobile] = useState(true);

    const [screen, setScreen] = useState<number | null>(null);

    // Setting the Screen Size State whenever the screen is resized
    useEffect(() => {
      const handleResize = () => setScreen(window.innerWidth);
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Toggling the isMobile State whenever the screensize changes
    useEffect(() => {
      if (screen! <= 768) {
        setIsMobile(true);
        setSidebarOpened(false);
      } else {
        setIsMobile(false);
        setSidebarOpened(true);
      }
    }, [screen]);

    const hasSelected = selected >= 0;

    const Mod = hasSelected ? loadedModules[selected]! : null;

    return (
      <div>
        {isMobile && (
          <button
            className="kitchen_sink-layout-icon"
            onClick={() => setSidebarOpened(true)}
          >
            <RxHamburgerMenu />
          </button>
        )}
        <h1>Million.js Kitchen Sink</h1>
        <p>
          Hey! We're actively recruiting cooks 🧑‍🍳 to help assemble a list of
          examples of Million + your favorite React library. Go to{' '}
          <a href="https://million.dev/kitchen-sink">
            million.dev/kitchen-sink
          </a>{' '}
          for details.
        </p>

        <div className="kitchen_sink-layout">
          <div
            className={`kitchen_sink-sidebar ${
              sidebarOpened
                ? 'kitchen_sink-sidebar_open'
                : 'kitchen_sink-sidebar_close'
            }`}
          >
            <div className="kitchen_sink-sidebar_container">
              {isMobile && (
                <button
                  className="kitchen_sink-layout-icon"
                  onClick={() => setSidebarOpened(false)}
                >
                  <AiOutlineClose />
                </button>
              )}
              {modules.map(([key], index) => {
                return (
                  <button
                    onClick={async () => {
                      isMobile && setSidebarOpened(false);
                      setSelected(index);
                      window.history.pushState(undefined, '', '/' + index);
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
          </div>
          <div className="kitchen_sink-content">
            <div className="kitchen_sink-content_container">
              <details open={hasSelected}>
                <summary>
                  Currently Selected:{' '}
                  <strong>
                    {hasSelected ? modules[selected]![0] : 'None'}
                  </strong>
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
          </div>
        </div>
      </div>
    );
  }

  createRoot(document.getElementById('root')!).render(<App />);
})();
