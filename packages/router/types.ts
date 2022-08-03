import type { VElement } from '../million/types';

export interface Route {
  vnode?: VElement;
  html?: Document;
  hook?: RouteHook;
  external?: boolean;
}

export type RouteHook = (url: URL, route: Route) => boolean;
