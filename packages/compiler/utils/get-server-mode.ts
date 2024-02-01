import type { StateContext } from "../types";

export function getServerMode(ctx: StateContext): 'server' | 'client' {
  return ctx.options.server ? 'server' : 'client';
}
