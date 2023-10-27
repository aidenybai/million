import * as Party from "partykit/server";

interface Cursor {
  // replicating the default connection fields to avoid
  // having to do an extra deserializeAttachment
  id: string;
  uri: string;

  // country is set upon connection
  country: string | null;

  // cursor fields are only set on first message
  x?: number;
  y?: number;
  pointer?: "mouse" | "touch";
  lastUpdate?: number;
}

type UpdateMessage = {
  type: "update";
  id: string; // websocket.id
} & Cursor;

interface SyncMessage {
  type: "sync";
  cursors: Record<string, Cursor>;
}

interface RemoveMessage {
  type: "remove";
  id: string; // websocket.id
}

type ConnectionWithCursor = Party.Connection & { cursor?: Cursor };

// server.ts
export default class CursorServer implements Party.Server {
  constructor(public party: Party.Party) {}
  options: Party.ServerOptions = {
    hibernate: true,
  };

  onConnect(
    websocket: Party.Connection,
    { request }: Party.ConnectionContext
  ): void | Promise<void> {
    const country = request.cf?.country ?? null;

    // Stash the country in the websocket attachment
    websocket.serializeAttachment({
      ...websocket.deserializeAttachment(),
      country,
    });

    console.log("[connect]", this.party.id, websocket.id, country);

    // On connect, send a "sync" message to the new connection
    // Pull the cursor from all websocket attachments
    const cursors: Record<string, Cursor> = {};
    for (const ws of this.party.getConnections()) {
      const id = ws.id;
      const cursor =
        (ws as ConnectionWithCursor).cursor ?? ws.deserializeAttachment();
      if (
        id !== websocket.id &&
        cursor !== null &&
        cursor.x !== undefined &&
        cursor.y !== undefined
      ) {
        cursors[id] = cursor;
      }
    }

    const msg = <SyncMessage>{
      type: "sync",
      cursors,
    };

    websocket.send(JSON.stringify(msg));
  }

  onMessage(
    message: string,
    websocket: Party.Connection
  ): void | Promise<void> {
    const position = JSON.parse(message );
    const prevCursor = this.getCursor(websocket);
    const cursor = <Cursor>{
      id: websocket.id,
      x: position.x,
      y: position.y,
      pointer: position.pointer,
      country: prevCursor?.country,
      lastUpdate: Date.now(),
    };

    this.setCursor(websocket, cursor);

    const msg =
      position.x && position.y
        ? <UpdateMessage>{
            type: "update",
            ...cursor,
            id: websocket.id,
          }
        : <RemoveMessage>{
            type: "remove",
            id: websocket.id,
          };

    // Broadcast, excluding self
    this.party.broadcast(JSON.stringify(msg), [websocket.id]);
  }

  getCursor(connection: ConnectionWithCursor) {
    if (!connection.cursor) {
      connection.cursor = connection.deserializeAttachment();
    }

    return connection.cursor;
  }

  setCursor(connection: ConnectionWithCursor, cursor: Cursor) {
    const prevCursor = connection.cursor;
    connection.cursor = cursor;

    // throttle writing to attachment to once every 100ms
    if (
      !prevCursor ||
      !prevCursor.lastUpdate ||
      (cursor.lastUpdate && cursor.lastUpdate - prevCursor.lastUpdate > 100)
    ) {
      // Stash the cursor in the websocket attachment
      connection.serializeAttachment({
        ...cursor,
      });
    }
  }

  onClose(websocket: Party.Connection) {
    // Broadcast a "remove" message to all connections
    const msg = <RemoveMessage>{
      type: "remove",
      id: websocket.id,
    };

    console.log(
      "[disconnect]",
      this.party.id,
      websocket.id,
      websocket.readyState
    );

    this.party.broadcast(JSON.stringify(msg), []);
  }
}

CursorServer satisfies Party.Worker;