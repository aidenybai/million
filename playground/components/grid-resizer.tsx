import { useState, type FC, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

const Dot: FC<{ isDragging: boolean }> = (props: { isDragging: boolean }) => {
  return (
    <div
      className={clsx(
        'h-1 w-1 rounded-full bg-slate-300 dark:bg-white dark:group-hover:bg-slate-200',
        {
          'bg-slate-200 dark:bg-slate-200': props.isDragging,
        },
      )}
    />
  );
};

interface GetResizePercentageOptions {
  cursorOffset: number;
  containerRectDistance: number;
  containerOffset: number;
  resizerOffset: number;
}

function getResizePercentage({
  containerRectDistance,
  containerOffset,
  cursorOffset,
  resizerOffset,
}: GetResizePercentageOptions) {
  const position = cursorOffset - containerRectDistance - resizerOffset / 2;
  const size = containerOffset - resizerOffset;
  const percentage = position / size;
  const percentageAdjusted = Math.min(Math.max(percentage, 0.25), 0.75);

  // position = clientY - rect.top - resizer.offsetHeight / 2;
  // size = grid.offsetHeight - resizer.offsetHeight;

  return percentageAdjusted;
}

interface GridResizerProps {
  direction: 'horizontal' | 'vertical';
  onResize: (percentage: number) => void;
}
export const GridResizer = ({ direction, onResize }: GridResizerProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const onResizeStart = () => setIsDragging(true);
  const onResizeEnd = () => setIsDragging(false);

  const onMove = (x: number, y: number) => {
    if (!ref.current) return;
    const parent = ref.current.parentElement;
    if (!parent) return;

    if (direction === 'horizontal') {
      const percentage = getResizePercentage({
        containerOffset: parent.offsetWidth,
        containerRectDistance: parent.getBoundingClientRect().left,
        cursorOffset: x,
        resizerOffset: ref.current.offsetWidth,
      });

      onResize(percentage);
      return;
    }

    const percentage = getResizePercentage({
      containerOffset: parent.offsetHeight,
      containerRectDistance: parent.getBoundingClientRect().top,
      cursorOffset: y,
      resizerOffset: ref.current.offsetHeight,
    });
    onResize(percentage);
  };

  const onMouseMove = (e: MouseEvent) => {
    onMove(e.clientX, e.clientY);
  };

  const onTouchMove = (e: TouchEvent) => {
    onMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.addEventListener('mousedown', onResizeStart, {
      passive: true,
    });
    ref.current.addEventListener('touchstart', onResizeStart, {
      passive: true,
    });

    return () => {
      ref.current?.removeEventListener('mousedown', onResizeStart);
      ref.current?.removeEventListener('touchstart', onResizeStart);
    };
  }, [ref.current]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onResizeEnd);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onResizeEnd);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onResizeEnd);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onResizeEnd);
      };
    }
  }, [isDragging]);

  return (
    <div
      ref={ref}
      className={clsx(
        'hover:bg-brand-default dark:hover:bg-brand-default flex items-center justify-center gap-2 border-slate-200 dark:border-neutral-800',
        {
          'bg-brand-default dark:bg-brand-default': !isDragging,
          'bg-blue-900 dark:bg-solid-darkbg/70': isDragging,
          'flex-col cursor-col-resize border-l-2 border-r-2 w-[12px]':
            direction === 'horizontal',
          'flex-row cursor-row-resize border-t-2 border-b-2 h-[12px]':
            direction === 'vertical',
        },
      )}
    >
      <div
        className={clsx({
          'fixed inset-0 z-10': isDragging,
          'cursor-col-resize': direction === 'vertical',
          'cursor-row-resize': direction === 'horizontal',
        })}
      />
      <Dot isDragging={isDragging} />
      <Dot isDragging={isDragging} />
      <Dot isDragging={isDragging} />
    </div>
  );
};
