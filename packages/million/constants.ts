/* eslint-disable @typescript-eslint/unbound-method */
export const Object$ = Object;
export const Map$ = Map;
export const Set$ = Set;

export const SetHas$ = Set$.prototype.has;
export const SetAdd$ = Set$.prototype.add;

export const MapHas$ = Map$.prototype.has;
export const MapGet$ = Map$.prototype.get;
export const MapSet$ = Map$.prototype.set;

export const ChildFlag = 1;
export const AttributeFlag = 2;
export const EventFlag = 4;
export const StyleAttributeFlag = 8;
export const SvgAttributeFlag = 16;
export const BlockFlag = 32;

export const TEXT_NODE_CACHE = '__t';
export const EVENT_PATCH = '__p';
export const EVENTS_REGISTRY = '__e';
export const IS_NON_DIMENSIONAL =
  /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
export const XLINK_NS = 'http://www.w3.org/1999/xlink';
export const XML_NS = 'http://www.w3.org/2000/xmlns/';
export const X_CHAR = 120;
// prettier-ignore
export const NON_PROPS = new Set$(['href', 'list', 'form', 'tabIndex', 'download']);
// prettier-ignore
export const VOID_ELEMENTS = new Set$(["area", "base", "basefont", "bgsound", "br", "col", "command", "embed", "frame", "hr", "image", "img", "input", "isindex", "keygen", "link", "menuitem", "meta", "nextid", "param", "source", "track", "wbr"]);
