import { useRouter } from 'next/router';
import { useEffect } from 'react';
import {
  RoomProvider,
  useOthers,
  useUpdateMyPresence,
} from '../liveblocks.config';
import { Cursor } from './cursor';

const COLORS = [
  '#E57373',
  '#9575CD',
  '#4FC3F7',
  '#81C784',
  '#FFF176',
  '#FF8A65',
  '#F06292',
  '#7986CB',
];

function useLiveCursors() {
  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    const scroll = {
      x: window.scrollX,
      y: window.scrollY,
    };

    let lastPosition: { x: number; y: number } | null = null;

    function transformPosition(cursor: { x: number; y: number }) {
      return {
        x: cursor.x / window.innerWidth,
        y: cursor.y,
      };
    }

    function onPointerMove(event: PointerEvent) {
      event.preventDefault();
      const position = {
        x: event.pageX,
        y: event.pageY,
      };
      lastPosition = position;
      updateMyPresence({
        cursor: transformPosition(position),
      });
    }

    function onPointerLeave() {
      lastPosition = null;
      updateMyPresence({ cursor: null });
    }

    function onDocumentScroll() {
      if (lastPosition) {
        const offsetX = window.scrollX - scroll.x;
        const offsetY = window.scrollY - scroll.y;
        const position = {
          x: lastPosition.x + offsetX,
          y: lastPosition.y + offsetY,
        };
        lastPosition = position;
        updateMyPresence({
          cursor: transformPosition(position),
        });
      }
      scroll.x = window.scrollX;
      scroll.y = window.scrollY;
    }

    document.addEventListener('scroll', onDocumentScroll);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerleave', onPointerLeave);

    return () => {
      document.removeEventListener('scroll', onDocumentScroll);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [updateMyPresence]);

  const others = useOthers();

  const cursors: {
    x: number;
    y: number;
    connectionId: number;
  }[] = [];

  for (const { connectionId, presence } of others) {
    if (presence.cursor) {
      cursors.push({
        x: presence.cursor.x * window.innerWidth,
        y: presence.cursor.y,
        connectionId,
      });
    }
  }

  return cursors;
}

export function Cursors() {
  const cursors = useLiveCursors();

  return (
    <>
      {cursors.map(({ x, y, connectionId }) => (
        <Cursor
          key={connectionId}
          color={COLORS[connectionId % COLORS.length]}
          x={x}
          y={y}
        />
      ))}
    </>
  );
}

export function getCount() {
  const others = useOthers();
  return others.length;
}

export function LiveProvider({ children }) {
  const { pathname } = useRouter();
  return (
    <RoomProvider
      id={`million-${pathname}`}
      initialPresence={{
        cursor: null,
      }}
    >
      {children}
      <Cursors />
    </RoomProvider>
  );
}
