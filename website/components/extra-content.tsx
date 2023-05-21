import dynamic from 'next/dynamic';
import { startTransition, useEffect, useRef, useState } from 'react';

const LagRadar = dynamic(() => import('react-lag-radar'), { ssr: false });

export function ExtraContent() {
  const [start, setStart] = useState<boolean>(false);
  const [renders, setRenders] = useState<number>(0);
  const ref = useRef<{
    renderReact: () => void;
    renderMillion: () => void;
  }>();

  useEffect(() => {
    const setup = async () => {
      const { block, mount, patch } = await import(
        './local-million/million.mjs'
      );
      const { createRoot } = await import('react-dom/client');

      const reactRoot = document.createElement('div');
      const millionRoot = document.createElement('div');

      const b = block(({ text }: { text: string }) => ({
        type: 'div',
        props: {
          children: [
            {
              type: 'div',
              props: {
                children: [
                  ...Array(300000)
                    .fill(0)
                    .map(() => ({
                      type: 'div',
                      props: {
                        children: [
                          {
                            type: 'div',
                            props: {},
                          },
                        ],
                      },
                    })),
                  {
                    type: 'div',
                    props: {
                      children: [text],
                    },
                  },
                ],
              },
            },
          ],
        },
      }));

      const Component = ({ text }) => {
        return (
          <div>
            <div>
              {Array(300000)
                .fill(0)
                .map(() => (
                  <div>
                    <div />
                  </div>
                ))}
              <div>{text}</div>
            </div>
          </div>
        );
      };

      const currentBlock = b({ text: String(Math.random()) });
      mount(currentBlock, millionRoot);
      const root = createRoot(reactRoot);

      root.render(<Component text={String(Math.random())} />);

      ref.current = {
        renderReact() {
          root.render(<Component text={String(Math.random())} />);
        },
        renderMillion() {
          patch(currentBlock, b({ text: String(Math.random()) }));
        },
      };
    };
    if (start) void setup();
  }, [start]);

  return (
    <div className="w-full border border-[#e5e7eb] dark:border-[#262626] bg-white dark:bg-[#141414] p-3 shadow rounded-lg">
      <div className="px-2 text-xs text-[#6b7280] font-semibold">
        SPEED SHOWDOWN ⚡
      </div>
      <hr className="border-[#e8e8e8] dark:border-[#4b4b4b] my-2" />
      {!start ? (
        <div>
          <button
            onClick={() => setStart(true)}
            className="w-full bg-[#f0e1ff] text-[#5200a3] dark:bg-[#17262f] dark:text-[#038ae6] px-2 py-2 font-bold rounded"
          >
            Begin
          </button>
        </div>
      ) : (
        <div>
          <div className="px-2 text-xs text-[#6b7280]">
            Click on a button to invoke a render cycle{' '}
            <span className="font-semibold">({renders} renders)</span>
          </div>
          <div className="flex justify-center my-4">
            <LagRadar />
          </div>
          <div className="flex gap-2 justify-center mb-4">
            <button
              onClick={() => {
                setRenders(renders + 1);
                ref.current?.renderMillion();
              }}
              className="bg-[#b073d9] transition-all active:scale-105 hover:opacity-80 font-bold text-white py-2 px-4 rounded-full shadow"
            >
              Million.js
            </button>
            <button
              onClick={() => {
                setRenders(renders + 1);
                startTransition(() => {
                  ref.current?.renderReact();
                });
              }}
              className="bg-[#139eca] transition-all active:scale-105 hover:opacity-80 text-white py-2 px-4 rounded-full shadow"
            >
              React
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
