import { createElement } from './createElement';
import { className, DELETE, INSERT, m, style, svg, UPDATE } from './m';
import { patch, patchChildren, patchProps } from './patch';
import { OLD_VNODE_FIELD, VElement, VFlags, VNode, VProps } from './structs';

export type { VNode, VElement, VProps };
export {
  createElement,
  className,
  m,
  style,
  svg,
  patch,
  patchProps,
  patchChildren,
  VFlags,
  INSERT,
  UPDATE,
  DELETE,
  OLD_VNODE_FIELD,
};
