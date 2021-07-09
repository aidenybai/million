import { OLD_VNODE_FIELD } from './constants';
import { createElement } from './createElement';
import { className, m, style, svg, INSERT, UPDATE, DELETE } from './m';
import { patch, patchChildren, patchProps } from './patch';
import { VElement, VFlags, VNode, VProps } from './structs';

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
