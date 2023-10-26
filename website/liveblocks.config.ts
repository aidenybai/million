import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';
import type { JsonObject} from '@liveblocks/client';

const client = createClient({
  throttle: 16,
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});
interface Presence extends JsonObject {
  cursor: { x: number; y: number } | null;
}

export const { RoomProvider, useOthers, useMyPresence, useUpdateMyPresence } =
  createRoomContext<Presence>(client);
