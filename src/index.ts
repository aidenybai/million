import { createElement } from './createElement';
import { className, m, style, svg, VFlags } from './m';
import { patch, patchProps, patchChildren } from './patch';

/**
 * Placeholder for undefined
 */
const _ = undefined;
/**
 * Field on DOM node that stores the previous VNode
 */
const OLD_VNODE_FIELD = '__m_old_vnode';

export {
  createElement,
  className,
  m,
  style,
  svg,
  patch,
  patchProps,
  patchChildren,
  _,
  OLD_VNODE_FIELD,
  VFlags,
};
