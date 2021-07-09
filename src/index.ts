import { OLD_VNODE_FIELD } from './constants';
import { createElement } from './createElement';
import { className, m, style, svg, INSERT, UPDATE, DELETE } from './m';
import { patch, patchChildren, patchProps } from './patch';
import type { VElement, VFlags, VNode, VProps, VDelta } from './structs';

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
  VNode,
  VElement,
  VProps,
  VDelta,
  INSERT,
  UPDATE,
  DELETE,
  OLD_VNODE_FIELD,
};
