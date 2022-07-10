import type { VElement } from '../million/types';

export interface Route {
  vnode?: VElement;
  html?: Document;
  hook?: RouteHook;
}

export type RouteHook = (url: URL, route: Route) => boolean;
