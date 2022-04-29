import { VElement } from '../million/types';

export interface Route {
  vnode?: VElement;
  html?: Document;
  hook?: RouteHook;
}

export type RouteHook = (url: URL, route: Route) => boolean;

export interface Controller {
  setRoute: (path: string, vnode: VElement) => Controller;
  removeRoute: (path: string) => Controller;
}
