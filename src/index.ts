export { createElement } from './createElement';
export { childrenDriver } from './drivers/children';
export { propsDriver } from './drivers/props';
export { className, DELETE, INSERT, m, style, svg, UPDATE } from './m';
export { init, patch } from './patch';
export { flush, nextTick, schedule, shouldYield } from './schedule';
export { OLD_VNODE_FIELD, VFlags } from './structs';
export type { VDelta, VElement, VNode, VProps } from './structs';
