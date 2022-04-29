import { VElement } from '../million/types';

export interface Route {
  vnode?: VElement;
  html?: Document;
  hook?: (url: URL) => boolean;
}

export type Listener = (data: { url: URL; opts?: RequestInit; goBack: boolean }) => void;

export interface Controller {
  setRoute: (path: string, vnode: VElement) => Controller;
  removeRoute: (path: string) => Controller;
}
