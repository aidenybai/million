import { OLD_VNODE_FIELD } from './constants';
import { createElement } from './createElement';
import { className, m, style, svg } from './m';
import { patch, patchChildren, patchProps } from './patch';
import type { VElement, VFlags, VActions, VNode, VProps } from './structs';

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
  VActions,
  VNode,
  VElement,
  VProps,
  OLD_VNODE_FIELD,
};
