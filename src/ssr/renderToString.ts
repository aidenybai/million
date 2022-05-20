import { VNode } from '../million/types';

export const renderToString = (vnode: VNode): string => {
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

  if (htmlVoidElements.includes(vnode.tag)) {
    return `<${vnode.tag}${attributes} />`;
  }

  for (const child of vnode.children || []) {
    children += renderToString(child);
  }

  return `<${vnode.tag}${attributes}>${children}</${vnode.tag}>`;
};

export const htmlVoidElements = [
  'area',
  'base',
  'basefont',
  'bgsound',
  'br',
  'col',
  'command',
  'embed',
  'frame',
  'hr',
  'image',
  'img',
  'input',
  'isindex',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'nextid',
  'param',
  'source',
  'track',
  'wbr',
];
