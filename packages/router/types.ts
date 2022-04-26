import { VElement } from '../million/types';

export interface Controller {
  on: (path: string, listener: () => any) => Controller;
  off: (path: string, listener: () => any) => Controller;
  add: (path: string, vnode: VElement) => Controller;
  remove: (path: string) => Controller;
}
