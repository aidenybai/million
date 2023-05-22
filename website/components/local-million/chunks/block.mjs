import { E as EVENTS_REGISTRY, S as Set$, O as Object$, a as SetHas$, b as SetAdd$, I as IS_NON_DIMENSIONAL, X as XML_NS, c as XLINK_NS, N as NON_PROPS, d as EventFlag, e as StyleAttributeFlag, f as X_CHAR, g as SvgAttributeFlag, A as AttributeFlag, V as VOID_ELEMENTS, C as ChildFlag, B as BlockFlag, M as Map$, h as MapSet$, T as TEXT_NODE_CACHE } from './constants.mjs';

if (typeof window === "undefined") {
  throw new Error(
    "See http://millionjs.org/docs/quickstart to use the compiler. If that doesn't work, import from `million/react-server` instead."
  );
}
const document$ = document;
const template$ = document$.createElement("template");
const node$ = Node.prototype;
const element$ = Element.prototype;
const characterData$ = CharacterData.prototype;
const getOwnPropertyDescriptor$ = Object$.getOwnPropertyDescriptor;
const insertBefore$ = node$.insertBefore;
const cloneNode$ = node$.cloneNode;
const remove$$1 = element$.remove;
const addEventListener$ = node$.addEventListener;
const removeAttribute$ = element$.removeAttribute;
const setAttribute$ = element$.setAttribute;
const setAttributeNS$ = element$.setAttributeNS;
const setTextContent$ = getOwnPropertyDescriptor$(node$, "textContent").set;
const innerHTML$ = getOwnPropertyDescriptor$(element$, "innerHTML").set;
const firstChild$ = getOwnPropertyDescriptor$(node$, "firstChild").get;
const nextSibling$ = getOwnPropertyDescriptor$(node$, "nextSibling").get;
const characterDataSet$ = getOwnPropertyDescriptor$(
  characterData$,
  "data"
).set;
document$[EVENTS_REGISTRY] = new Set$();
const createEventListener = (el, name, value) => {
  const event = name.toLowerCase();
  const key = `$$${event}`;
  if (!SetHas$.call(document$[EVENTS_REGISTRY], event)) {
    addEventListener$.call(document$, event, (nativeEventObject) => {
      requestAnimationFrame(() => {
        let el2 = nativeEventObject.target;
        while (el2) {
          const handler = el2[key];
          if (handler) {
            let returnFalse = false;
            if (handler(nativeEventObject) === false) {
              returnFalse = true;
            }
            if (returnFalse)
              return;
          }
          el2 = el2.parentNode;
        }
      });
    });
    SetAdd$.call(document$[EVENTS_REGISTRY], event);
  }
  const patch = (newValue) => {
    if (!newValue) {
      el[key] = null;
    } else if (!("key" in newValue && newValue.key === el[key]?.key)) {
      el[key] = newValue;
    }
  };
  patch(value);
  return patch;
};
const childAt = (el, index) => {
  let child = firstChild$.call(el);
  if (index) {
    for (let j = 0; j < index; ++j) {
      if (!child)
        break;
      child = nextSibling$.call(child);
    }
  }
  return child;
};
const insertText = (el, value, index) => {
  const node = document$.createTextNode(value);
  const child = childAt(el, index);
  insertBefore$.call(el, node, child);
  return node;
};
const setText = (el, value) => {
  characterDataSet$.call(el, value);
};
const setStyleAttribute = (el, name, value) => {
  if (typeof value !== "number" || IS_NON_DIMENSIONAL.test(name)) {
    el.style[name] = value;
  } else if (typeof value === "string") {
    el.style.cssText = value;
  } else if (name.startsWith("-")) {
    el.style.setProperty(name, String(value));
  } else if (value === void 0 || value === null) {
    el.style[name] = "";
  } else {
    el.style[name] = `${String(value)}px`;
  }
};
const setSvgAttribute = (el, name, value) => {
  name = name.replace(/xlink(?:H|:h)/, "h").replace(/sName$/, "s");
  if (name.startsWith("xmlns")) {
    setAttributeNS$.call(el, XML_NS, name, String(value));
  } else if (name.startsWith("xlink")) {
    setAttributeNS$.call(el, XLINK_NS, "href", String(value));
  }
};
const setAttribute = (el, name, value) => {
  const isValueNully = value === void 0 || value === null;
  value = isValueNully ? "" : value;
  if (name in el && el[name] !== void 0 && el[name] !== null && !(el instanceof SVGElement) && SetHas$.call(NON_PROPS, name)) {
    try {
      el[name] = value;
    } catch (_err) {
    }
  } else if (!isValueNully && value !== "" && (value !== false || name.includes("-"))) {
    setAttribute$.call(el, name, String(value));
  } else {
    removeAttribute$.call(el, name);
  }
};

class AbstractBlock {
}

const renderToTemplate = (vnode, edits = [], path = []) => {
  if (typeof vnode === "string")
    return vnode;
  if (typeof vnode === "number" || typeof vnode === "bigint" || vnode === true) {
    return String(vnode);
  }
  if (vnode === null || vnode === void 0 || vnode === false)
    return "";
  let props = "";
  let children = "";
  const current = {
    p: path,
    e: [],
    i: []
  };
  for (let name in vnode.props) {
    const value = vnode.props[name];
    if (name === "key" || name === "ref" || name === "children") {
      continue;
    }
    if (name === "className")
      name = "class";
    if (name === "htmlFor")
      name = "for";
    if (name.startsWith("on")) {
      const isValueHole = "$" in value;
      if (isValueHole) {
        current.e.push({
          t: EventFlag,
          n: name.slice(2),
          v: null,
          h: value.$,
          i: null,
          l: null,
          p: null,
          b: null
        });
      } else {
        current.i.push({
          t: EventFlag,
          n: name.slice(2),
          v: null,
          h: null,
          i: null,
          l: value,
          p: null,
          b: null
        });
      }
      continue;
    }
    if (value) {
      if (typeof value === "object" && "$" in value) {
        if (name === "style") {
          current.e.push({
            t: StyleAttributeFlag,
            n: name,
            v: null,
            h: value.$,
            i: null,
            l: null,
            p: null,
            b: null
          });
        } else if (name.charCodeAt(0) === X_CHAR) {
          current.e.push({
            t: SvgAttributeFlag,
            n: name,
            v: null,
            h: value.$,
            i: null,
            l: null,
            p: null,
            b: null
          });
        } else {
          current.e.push({
            t: AttributeFlag,
            n: name,
            v: null,
            h: value.$,
            i: null,
            l: null,
            p: null,
            b: null
          });
        }
        continue;
      }
      if (name === "style") {
        let style = "";
        for (const key in value) {
          style += `${key}:${String(value[key])};`;
        }
        props += ` style="${style}"`;
        continue;
      }
      props += ` ${name}="${String(value)}"`;
    }
  }
  if (SetHas$.call(VOID_ELEMENTS, vnode.type)) {
    if (current.e.length)
      edits.push(current);
    return `<${vnode.type}${props} />`;
  }
  let canMergeString = false;
  for (let i = 0, j = vnode.props.children?.length || 0, k = 0; i < j; ++i) {
    const child = vnode.props.children?.[i];
    if (child === null || child === void 0 || child === false)
      continue;
    if (typeof child === "object" && "$" in child) {
      current.e.push({
        t: ChildFlag,
        n: null,
        v: null,
        h: child.$,
        i,
        l: null,
        p: null,
        b: null
      });
      continue;
    }
    if (child instanceof AbstractBlock) {
      current.i.push({
        t: BlockFlag,
        n: null,
        v: null,
        h: null,
        i,
        l: null,
        p: null,
        b: child
      });
      continue;
    }
    if (typeof child === "string" || typeof child === "number" || typeof child === "bigint") {
      const value = typeof child === "number" || typeof child === "bigint" ? String(child) : child;
      if (canMergeString) {
        current.i.push({
          t: ChildFlag,
          n: null,
          v: value,
          h: null,
          i,
          l: null,
          p: null,
          b: null
        });
        continue;
      }
      canMergeString = true;
      children += value;
      k++;
      continue;
    }
    canMergeString = false;
    const newPath = path.slice();
    newPath.push(k++);
    children += renderToTemplate(child, edits, newPath);
  }
  if (current.i.length || current.e.length)
    edits.push(current);
  return `<${vnode.type}${props}>${children}</${vnode.type}>`;
};

const mapArray = (children) => {
  return new ArrayBlock(children);
};
class ArrayBlock extends AbstractBlock {
  constructor(children) {
    super();
    this.b = children;
  }
  v() {
  }
  p(fragment) {
    const oldChildren = this.b;
    const newChildren = fragment.b;
    const oldChildrenLength = oldChildren.length;
    const newChildrenLength = newChildren.length;
    const parent = this.t();
    if (this === fragment)
      return parent;
    if (newChildrenLength === 0 && oldChildrenLength === 0)
      return parent;
    this.b = newChildren;
    if (newChildrenLength === 0) {
      arrayRemove$.call(this);
      return parent;
    }
    if (oldChildrenLength === 0) {
      arrayMount$.call(fragment, parent);
      return parent;
    }
    let oldHead = 0;
    let newHead = 0;
    let oldTail = oldChildrenLength - 1;
    let newTail = newChildrenLength - 1;
    let oldHeadChild = oldChildren[0];
    let newHeadChild = newChildren[0];
    let oldTailChild = oldChildren[oldTail];
    let newTailChild = newChildren[newTail];
    let oldKeyMap;
    while (oldHead <= oldTail && newHead <= newTail) {
      if (!oldHeadChild) {
        oldHeadChild = oldChildren[++oldHead];
        continue;
      }
      if (!oldTailChild) {
        oldTailChild = oldChildren[--oldTail];
        continue;
      }
      const oldHeadKey = oldHeadChild.k;
      const newHeadKey = newHeadChild.k;
      if (oldHeadKey === newHeadKey) {
        patch$.call(oldHeadChild, newHeadChild);
        newChildren[newHead] = oldHeadChild;
        oldHeadChild = oldChildren[++oldHead];
        newHeadChild = newChildren[++newHead];
        continue;
      }
      const oldTailKey = oldTailChild.k;
      const newTailKey = newTailChild.k;
      if (oldTailKey === newTailKey) {
        patch$.call(oldTailChild, newTailChild);
        newChildren[newTail] = oldTailChild;
        oldTailChild = oldChildren[--oldTail];
        newTailChild = newChildren[--newTail];
        continue;
      }
      if (oldHeadKey === newTailKey) {
        patch$.call(oldHeadChild, newTailChild);
        newChildren[newTail] = oldHeadChild;
        const nextChild = newChildren[newTail + 1];
        move$.call(oldHeadChild, nextChild, nextChild?.l || null);
        oldHeadChild = oldChildren[++oldHead];
        newTailChild = newChildren[--newTail];
        continue;
      }
      if (oldTailKey === newHeadKey) {
        patch$.call(oldTailChild, newHeadChild);
        newChildren[newHead] = oldTailChild;
        const nextChild = oldChildren[oldHead];
        move$.call(oldTailChild, nextChild, nextChild?.l || null);
        oldTailChild = oldChildren[--oldTail];
        newHeadChild = newChildren[++newHead];
        continue;
      }
      if (!oldKeyMap) {
        oldKeyMap = new Map$();
        for (let i = oldHead; i <= oldTail; i++) {
          MapSet$.call(oldKeyMap, oldChildren[i].k, i);
        }
      }
      const oldIndex = oldKeyMap.get(newHeadKey);
      if (oldIndex === void 0) {
        mount$.call(newHeadChild, parent, oldHeadChild.l || null);
      } else {
        const oldChild = oldChildren[oldIndex];
        move$.call(oldChild, oldHeadChild, null);
        patch$.call(oldChild, newHeadChild);
        newChildren[newHead] = oldChild;
        oldChildren[oldIndex] = null;
      }
      newHeadChild = newChildren[++newHead];
    }
    if (oldHead <= oldTail || newHead <= newTail) {
      if (oldHead > oldTail) {
        const nextChild = newChildren[newTail + 1];
        for (let i = newHead; i <= newTail; ++i) {
          mount$.call(newChildren[i], parent, nextChild ? nextChild.l : null);
        }
      } else {
        for (let i = oldHead; i <= oldTail; ++i) {
          remove$.call(oldChildren[i]);
        }
      }
    }
    return parent;
  }
  m(parent, refNode = null) {
    if (this._t)
      return this._t;
    for (let i = 0, j = this.b.length; i < j; ++i) {
      const block = this.b[i];
      mount$.call(block, parent, refNode);
    }
    this._t = parent;
    return parent;
  }
  x() {
    const parent = this.t();
    if (parent) {
      setTextContent$.call(parent, "");
    } else {
      for (let i = 0, j = this.b.length; i < j; ++i) {
        remove$.call(this.b[i]);
      }
    }
    this.b = [];
  }
  u() {
    return true;
  }
  s() {
    return this.b.map((block) => block.s()).join("");
  }
  t() {
    if (!this._t)
      this._t = this.b[0].t();
    return this._t;
  }
}
const array$ = ArrayBlock.prototype;
const arrayMount$ = array$.m;
const arrayPatch$ = array$.p;
const arrayRemove$ = array$.x;

const HOLE_PROXY = new Proxy(
  {},
  {
    get(_, key) {
      return { $: key };
    }
  }
);
const block = (fn, unwrap, shouldUpdate) => {
  const vnode = fn(HOLE_PROXY);
  const edits = [];
  const root = stringToDOM(
    renderToTemplate(unwrap ? unwrap(vnode) : vnode, edits)
  );
  return (props, key, shouldUpdateCurrentBlock) => {
    return new Block(
      root,
      edits,
      props,
      key ?? props?.key,
      shouldUpdateCurrentBlock ?? shouldUpdate
    );
  };
};
const mount = (block2, parent) => {
  if ("b" in block2 && parent) {
    return arrayMount$.call(block2, parent);
  }
  return mount$.call(block2, parent);
};
const patch = (oldBlock, newBlock) => {
  if ("b" in oldBlock || "b" in newBlock) {
    arrayPatch$.call(oldBlock, newBlock);
  }
  if (!oldBlock.l)
    mount$.call(oldBlock);
  if (oldBlock.k && oldBlock.k === newBlock.k || oldBlock.r === newBlock.r) {
    return patch$.call(oldBlock, newBlock);
  }
  const el = mount$.call(newBlock, oldBlock.t(), oldBlock.l);
  remove$.call(oldBlock);
  oldBlock.k = newBlock.k;
  return el;
};
class Block extends AbstractBlock {
  constructor(root, edits, props, key, shouldUpdate, getElements) {
    super();
    this.r = root;
    this.d = props;
    this.e = edits;
    this.k = key;
    this.c = Array(edits.length);
    if (shouldUpdate)
      this.u = shouldUpdate;
    if (getElements)
      this.g = getElements;
  }
  m(parent, refNode = null) {
    if (this.l)
      return this.l;
    const root = cloneNode$.call(this.r, true);
    const elements = this.g?.(root);
    if (elements)
      this.c = elements;
    for (let i = 0, j = this.e.length; i < j; ++i) {
      const current = this.e[i];
      const el = elements?.[i] ?? getCurrentElement(current.p, root, this.c, i);
      for (let k = 0, l = current.e.length; k < l; ++k) {
        const edit = current.e[k];
        const value = this.d[edit.h];
        if (edit.t & ChildFlag) {
          if (value === null || value === void 0 || value === false) {
            continue;
          }
          if (value instanceof AbstractBlock) {
            value.m(el);
            continue;
          }
          if (!el[TEXT_NODE_CACHE])
            el[TEXT_NODE_CACHE] = new Array(l);
          if (typeof value === "function") {
            const scopeEl = value(null);
            el[TEXT_NODE_CACHE][k] = scopeEl;
            insertBefore$.call(el, scopeEl, childAt(el, edit.i));
            continue;
          }
          el[TEXT_NODE_CACHE][k] = insertText(el, String(value), edit.i);
        } else if (edit.t & EventFlag) {
          const patch2 = createEventListener(el, edit.n, value);
          edit.p = patch2;
        } else if (edit.t & AttributeFlag) {
          setAttribute(el, edit.n, value);
        } else if (edit.t & StyleAttributeFlag) {
          if (typeof value === "string") {
            setStyleAttribute(el, edit.n, value);
          } else {
            for (const style in value) {
              setStyleAttribute(el, style, value[style]);
            }
          }
        } else {
          setSvgAttribute(el, edit.n, value);
        }
      }
      const initsLength = current.i?.length;
      if (!initsLength)
        continue;
      for (let k = 0; k < initsLength; ++k) {
        const init = current.i[k];
        if (init.t & ChildFlag) {
          insertText(el, init.v, init.i);
        } else if (init.t & EventFlag) {
          createEventListener(el, init.n, init.l);
        } else {
          init.b.m(el, childAt(el, init.i));
        }
      }
    }
    if (parent) {
      insertBefore$.call(parent, root, refNode);
    }
    this.l = root;
    return root;
  }
  p(newBlock) {
    const root = this.l;
    if (!newBlock.d)
      return root;
    const props = this.d;
    if (!shouldUpdate$.call(this, props, newBlock.d))
      return root;
    this.d = newBlock.d;
    for (let i = 0, j = this.e.length; i < j; ++i) {
      const current = this.e[i];
      const el = this.c[i] ?? getCurrentElement(current.p, root, this.c, i);
      for (let k = 0, l = current.e.length; k < l; ++k) {
        const edit = current.e[k];
        const oldValue = props[edit.h];
        const newValue = newBlock.d[edit.h];
        if (newValue === oldValue)
          continue;
        if (edit.t & EventFlag) {
          edit.p(newValue);
          continue;
        }
        if (edit.t & ChildFlag) {
          if (oldValue instanceof AbstractBlock) {
            const firstEdit = newBlock.e?.[i]?.e[k];
            const newChildBlock = newBlock.d[firstEdit.h];
            oldValue.p(newChildBlock);
            continue;
          }
          if (typeof newValue === "function") {
            newValue(el[TEXT_NODE_CACHE][k]);
            continue;
          }
          setText(
            el[TEXT_NODE_CACHE][k],
            newValue === null || newValue === void 0 || newValue === false ? "" : String(newValue)
          );
        } else if (edit.t & AttributeFlag) {
          setAttribute(el, edit.n, newValue);
        } else if (edit.t & StyleAttributeFlag) {
          if (typeof newValue === "string") {
            setStyleAttribute(el, edit.n, newValue);
          } else {
            for (const style in newValue) {
              if (newValue[style] !== oldValue[style]) {
                setStyleAttribute(el, style, newValue[style]);
              }
            }
          }
        } else {
          setSvgAttribute(el, edit.n, newValue);
        }
      }
    }
    return root;
  }
  v(block2 = null, refNode = null) {
    insertBefore$.call(this.t(), this.l, block2 ? block2.l : refNode);
  }
  x() {
    remove$$1.call(this.l);
    this.l = null;
  }
  u(_oldProps, _newProps) {
    return true;
  }
  s() {
    return String(this.l?.outerHTML);
  }
  t() {
    if (!this._t)
      this._t = this.l?.parentElement;
    return this._t;
  }
}
const getCurrentElement = (path, root, cache, key) => {
  const pathLength = path.length;
  if (!pathLength)
    return root;
  if (cache && key !== void 0 && cache[key]) {
    return cache[key];
  }
  for (let i = 0; i < pathLength; ++i) {
    const siblings = path[i];
    root = childAt(root, siblings);
  }
  if (cache && key !== void 0)
    cache[key] = root;
  return root;
};
const stringToDOM = (content) => {
  innerHTML$.call(template$, content);
  return template$.content.firstChild;
};
const withKey = (value, key) => {
  value.key = key;
  return value;
};
const block$ = Block.prototype;
const mount$ = block$.m;
const patch$ = block$.p;
const move$ = block$.v;
const remove$ = block$.x;
const shouldUpdate$ = block$.u;

export { ArrayBlock as A, Block as B, mapArray as a, block as b, AbstractBlock as c, document$ as d, mount$ as e, firstChild$ as f, remove$ as g, arrayPatch$ as h, arrayMount$ as i, mount as m, nextSibling$ as n, patch as p, renderToTemplate as r, stringToDOM as s, withKey as w };
