import { block as internalBlock, patch, mount } from '../million';

export { block } from './block';
export { For } from './for';
export { renderReactScope, unwrap, areCompiledBlockPropsEqual } from './utils';
export { REGISTRY } from './constants';
export const INTERNALS = {
  block: internalBlock,
  patch,
  mount,
};
