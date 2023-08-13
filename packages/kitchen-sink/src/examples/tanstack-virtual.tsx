import { useRef } from 'react';
import { For } from 'million/react';
import { useVirtualizer } from '@tanstack/react-virtual';

const TanstackVirtual = () => {
  const parentRef = useRef();

  const rowVirtualizer = useVirtualizer({
    count: 10000,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    getScrollElement: () => parentRef.current!,
    estimateSize: () => 35,
  });

  return (
    <>
      {/* @ts-expect-error ref */}
      <div ref={parentRef} style={{ height: `400px`, overflow: 'auto' }}>
        <For
          each={rowVirtualizer.getVirtualItems()}
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
          as="div"
        >
          {(virtualItem) => (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                fontSize: '20px',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              Row {virtualItem.index}
            </div>
          )}
        </For>
      </div>
    </>
  );
};

export default TanstackVirtual;
