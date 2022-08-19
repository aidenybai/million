import { html } from '../html';
import { h } from '../jsx-runtime/h';
import { OLD_VNODE_FIELD } from '../million/types';
import type { DOMNode, VNode, VProps } from '../million/types';

export const fromStringToVNode = (htmlString: string): VNode | VNode[] => {
  try {
    return html([htmlString]);
  } catch (_err) {
    return fromDomNodeToVNode(fromStringToDomNode(htmlString))!;
  }
};

export const fromDomNodeToVNode = (el: DOMNode): VNode | undefined => {
  if (el[OLD_VNODE_FIELD]) return el[OLD_VNODE_FIELD];
  if (el instanceof Text) return String(el.nodeValue);
  if (el instanceof Comment) return undefined;

  const props: VProps = {};
  // We know children length, so we created a fixed array
  const children = new Array(el.children.length).fill(0);
  for (let i = 0; i < el.attributes.length; i++) {
    const { nodeName, nodeValue } = el.attributes[i]!;
    props[nodeName] = nodeValue;
  }
  for (let i = 0; i < el.childNodes.length; i++) {
    children[i] = fromDomNodeToVNode(el.childNodes.item(i) as DOMNode);
  }

  const vnode = h(el.tagName.toLowerCase(), props, ...children) as
    | VNode
    | undefined;
  el[OLD_VNODE_FIELD] = vnode;
  return vnode;
};

export const fromStringToDomNode = (htmlString: string): DOMNode => {
  const doc = new DOMParser().parseFromString(
    `<t>${htmlString.trim()}</t>`,
    'text/xml',
  );
  const el = doc.firstChild!.firstChild! as DOMNode;
  return el;
};

// Taken from Preact https://github.com/preactjs/preact-render-to-string/blob/38036d695af960c656302846e5064f61f9a7ea1f/src/util.js#L58
const JS_TO_CSS = {};
const CSS_REGEX = /[A-Z]/g;
const IS_NON_DIMENSIONAL =
  /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|^--/i;

export const styleObjectToCss = (styleObject: Record<string, any>) => {
  let str = '';
  for (const prop in styleObject) {
    const value = styleObject[prop];
    if (value !== null && value !== '') {
      if (str) str += ' ';
      str += prop.startsWith('-')
        ? prop
        : JS_TO_CSS[prop] ||
          (JS_TO_CSS[prop] = prop.replace(CSS_REGEX, '-$1').toLowerCase());

      if (typeof value === 'number' && !IS_NON_DIMENSIONAL.test(prop)) {
        str = `${str}: ${value}px;`;
      } else {
        str = `${str}: ${String(value)};`;
      }
    }
  }
  return str || undefined;
};

export const fromVNodeToString = (vnode?: VNode): string => {
  if (typeof vnode === 'string') return vnode;
  if (vnode === undefined) return '<!-- -->';

  let attributes = '';
  let children = '';

  for (let prop in vnode.props) {
    // Event listeners are attached AFTER the JavaScript is loaded on the page
    if (
      prop === 'key' ||
      prop === 'ref' ||
      prop === 'children' ||
      prop.startsWith('on')
    ) {
      continue;
    }

    let propValue = vnode.props[prop];

    if (prop === 'className') prop = 'class';
    if (prop === 'for') prop = 'htmlFor';
    if (prop === 'style') propValue = styleObjectToCss(propValue);
    attributes += ` ${prop}="${String(propValue)}"`;
  }

  if (htmlVoidElements.includes(vnode.tag)) {
    return `<${vnode.tag}${attributes} />`;
  }

  for (const child of vnode.children || []) {
    children += fromVNodeToString(child);
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
