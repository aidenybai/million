import { VElement } from '../million/types';

export type Listener = (data: { url: URL; opts?: RequestInit; goBack: boolean }) => void;

export interface Controller {
  on: (path: string, listener: Listener) => Controller;
  off: (path: string, listener: Listener) => Controller;
  add: (path: string, vnode: VElement) => Controller;
  remove: (path: string) => Controller;
}
