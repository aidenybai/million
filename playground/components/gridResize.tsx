import {
  useState,
  type FC,
  useEffect,
  useRef,
  Ref,
  forwardRef,
  MutableRefObject,
} from 'react';
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

export const GridResizer = forwardRef<
  MutableRefObject<HTMLDivElement>,
  {
    isHorizontal: boolean;
    onResize: (clientX: number, clientY: number) => void;
  }
>((props, r) => {
  let ref = r as unknown as MutableRefObject<HTMLDivElement>;
  const [isDragging, setIsDragging] = useState(false);

  const onResizeStart = () => setIsDragging(true);
  const onResizeEnd = () => setIsDragging(false);

  const onMouseMove = (e: MouseEvent) => {
    props.onResize(e.clientX, e.clientY);
  };

  const onTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    props.onResize(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    if (!ref?.current!) {
      return;
    }

    ref.current.addEventListener('mousedown', onResizeStart, { passive: true });
    ref.current.addEventListener('touchstart', onResizeStart, {
      passive: true,
    });

    return () => {
      ref.current.removeEventListener('mousedown', onResizeStart);
      ref.current.removeEventListener('touchstart', onResizeStart);
    };
  }, [ref && ref.current]);

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
          'bg-brand-default dark:bg-brand-default': isDragging,
          'bg-slate-50 dark:bg-solid-darkbg/70': !isDragging,
          'flex-col cursor-col-resize border-l-2 border-r-2 w-[12px]':
            props.isHorizontal,
          'flex-row cursor-row-resize border-t-2 border-b-2 h-[12px]':
            !props.isHorizontal,
        },
      )}
    >
      <div
        className={clsx({
          'fixed inset-0 z-10': isDragging,
          hidden: !isDragging,
          'cursor-col-resize': !props.isHorizontal,
          'cursor-row-resize': props.isHorizontal,
        })}
      />
      <Dot isDragging={isDragging} />
      <Dot isDragging={isDragging} />
      <Dot isDragging={isDragging} />
    </div>
  );
});
