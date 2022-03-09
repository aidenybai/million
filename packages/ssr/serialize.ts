import { VNode } from '../million/types';

export const serialize = (vnode: VNode): string => {
  if (typeof vnode === 'string') return vnode;
  if (vnode === undefined) return '<!-- -->';

  let attributes = '';
  let children = '';

  for (const prop in vnode.props) {
    // Event listeners are attached AFTER the JavaScript is loaded on the page
    if (!prop.toLowerCase().startsWith('on')) {
      attributes += ` ${prop}="${vnode.props[prop]}"`;
    }
  }
  for (const child of vnode.children || []) {
    children += serialize(child);
  }

  return `<${vnode.tag}${attributes}>${children}</${vnode.tag}>`;
};
