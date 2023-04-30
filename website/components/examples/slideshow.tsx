import { useState } from 'react';

export const motionAnimationProps = {
  initial: { pathLength: 0 },
  animate: { pathLength: 1 },
  transition: {
    duration: 1,
    ease: 'easeInOut',
  },
};

export function Slideshow({
  frames,
  descriptions,
}: {
  frames: JSX.Element[];
  descriptions: string[];
}) {
  const [frame, setFrame] = useState<number>(0);

  return (
    <div className="w-full justify-center flex flex-col gap-2">
      <div className="flex-shrink-0">{frames[frame]}</div>
      <div className="w-full flex gap-2 justify-center items-center text-gray-500 h-24">
        <small className="text-center">{descriptions[frame]}</small>
      </div>
      <div className="w-full flex gap-2 justify-center items-center">
        <button
          className="bg-gray-500 py-2 px-8 rounded font-bold font-mono hover:bg-gray-600 transition-colors disabled:opacity-30"
          disabled={frame <= 0}
          onClick={() => {
            if (frame <= 0) return;
            setFrame(frame - 1);
          }}
        >
          --
        </button>
        <p className="font-bold font-mono">
          ({frame + 1}/{frames.length})
        </p>
        <button
          className="bg-gray-500 py-2 px-8 rounded font-bold  font-mono hover:bg-gray-600 transition-colors disabled:opacity-30"
          disabled={frame >= frames.length - 1}
          onClick={() => {
            if (frame >= frames.length - 1) return;
            setFrame(frame + 1);
          }}
        >
          ++
        </button>
      </div>
    </div>
  );
}
