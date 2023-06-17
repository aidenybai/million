import clsx from 'clsx';
import {
  useState,
  type ReactNode,
  useRef,
  useLayoutEffect,
  useEffect,
} from 'react';
import { GridResizer } from './grid-resizer';

interface ResizableStackProps {
  direction: 'horizontal' | 'vertical';

  first: ReactNode;
  second: ReactNode;

  initialSize?: number;
}

export const ResizableStack = ({
  direction,
  first,
  second,
  initialSize = 0.5,
}: ResizableStackProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parentSize, setParentSize] = useState(0);
  const [firstSize, setFirstSize] = useState(initialSize);

  const onResize = (percentage: number) => {
    setFirstSize(percentage);
  };

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    setParentSize(
      containerRef.current.getBoundingClientRect()[
        direction === 'horizontal' ? 'width' : 'height'
      ] - 12,
    );
  }, []);

  useEffect(() => {
    function onWindowResize() {
      if (!containerRef.current) return;
      setParentSize(
        containerRef.current.getBoundingClientRect()[
          direction === 'horizontal' ? 'width' : 'height'
        ] - 12,
      );
    }
    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  const sizeTarget = direction === 'horizontal' ? 'width' : 'height';

  return (
    <div
      ref={containerRef}
      className={clsx('flex w-full h-full flex-1 self-stretch', {
        'flex-row items-stretch': direction === 'horizontal',
        'flex-col': direction === 'vertical',
      })}
    >
      <div
        className="flex overflow-hidden"
        style={{
          [sizeTarget]: `${firstSize * parentSize}px`,
        }}
      >
        {first}
      </div>

      <GridResizer direction={direction} onResize={onResize} />

      <div
        className="flex overflow-hidden"
        style={{
          [sizeTarget]: `${(1 - firstSize) * parentSize}px`,
        }}
      >
        {second}
      </div>
    </div>
  );
};
