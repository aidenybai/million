export const EVENTS_REGISTRY = '__million_events';
export const IS_NON_DIMENSIONAL =
  /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
export const XLINK_NS = 'http://www.w3.org/1999/xlink';
export const XML_NS = 'http://www.w3.org/2000/xmlns/';
export const X_CHAR = 120;
// prettier-ignore
export const NON_PROPS = new Set(['href', 'list', 'form', 'tabIndex', 'download']);
// prettier-ignore
export const VOID_ELEMENTS = new Set(["area", "base", "basefont", "bgsound", "br", "col", "command", "embed", "frame", "hr", "image", "img", "input", "isindex", "keygen", "link", "menuitem", "meta", "nextid", "param", "source", "track", "wbr"]);
