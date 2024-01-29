import { block as internalBlock, patch, mount, setAttribute } from '../million';
import {mountContext} from './for'

export { block } from './block';
export { For } from './for';
export { renderReactScope, unwrap } from './utils';
export { REGISTRY } from './constants';
export const INTERNALS = {
  block: internalBlock,
  patch,
  mount,
  setAttribute,
  mountContext
};

export {
  compiledBlock,
} from './compiled-block';

if (typeof window !== 'undefined') {
  (window as any).__MILLION_DATA__ = {
    version: process.env.VERSION,
  };
}
