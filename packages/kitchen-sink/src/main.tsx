import { StrictMode, useState, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const modules = Object.entries(
  import.meta.glob('./examples/*.tsx', { eager: true }),
).map(
  ([key, mod]) =>
    [
      key.replace('./examples/', '').replace('.tsx', ''),
      mod as Record<string, ComponentType>,
    ] as const,
);

function App() {
  const [selected, setSelected] = useState<number>(-1);
  const hasSelected = selected >= 0;

  const Mod = hasSelected ? modules[selected][1].default : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        {modules.map(([key], index) => {
          return (
            <button
              onClick={() => setSelected(index)}
              key={key}
              disabled={hasSelected && selected === index}
            >
              {key.replace('./examples/', '').replace('.tsx', '')}
            </button>
          );
        })}{' '}
      </div>
      <p>
        Currently Selected:{' '}
        <strong>{hasSelected ? modules[selected][0] : 'None'}</strong>
      </p>
      <div
        style={{
          border: '1px solid black',
          padding: '1rem',
          height: '100%',
        }}
      >
        {hasSelected && Mod && <Mod />}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
