import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';
import type { JsonObject } from '@liveblocks/client';

const isDevelopment: boolean = process.env.NODE_ENV === 'development';

const client = createClient({
  throttle: 16,
  publicApiKey: isDevelopment
    ? 'pk_mock-api-key'
    : process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});
if (isDevelopment) {
  // eslint-disable-next-line no-console
  console.warn('Development mode: using mock API key');
}
interface Presence extends JsonObject {
  cursor: { x: number; y: number } | null;
}

export const { RoomProvider, useOthers, useMyPresence, useUpdateMyPresence } =
  createRoomContext<Presence>(client);
