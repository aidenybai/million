(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Million = {}));
}(this, (function (exports) { 'use strict';

  const h = (tag, props, children) => {
      if ('style' in props) {
          props.style = Object.entries(props.style)
              .map((style) => style.join(':'))
              .join(';');
      }
      if ('class' in props) {
          delete props.class;
          props.className = Object.values(props)
              .filter((classEnabled) => classEnabled)
              .join(' ');
      }
      return {
          tag,
          props,
          children,
      };
  };

  const element = (vnode) => {
      if (typeof vnode === 'string')
          return document.createTextNode(vnode);
      const el = document.createElement(vnode?.tag);
      if (vnode.props) {
          Object.entries(vnode.props).forEach(([name, value]) => {
              el[name] = value;
          });
      }
      if (vnode.children) {
          vnode.children.forEach((child) => {
              el.appendChild(element(child));
          });
      }
      return el;
  };

  const OLD_VNODE_FLAG = '__old_v_node';
  const diffProps = (el, oldProps = {}, newProps = {}) => {
      Object.keys(oldProps).forEach((propName) => {
          const newPropValue = newProps[propName];
          if (newPropValue) {
              if (newPropValue !== oldProps[propName])
                  el[propName] = newPropValue;
              return;
          }
          el[propName] = undefined;
      });
  };
  const diffChildren = (el, oldVNodeChildren = [], newVNodeChildren = []) => {
      oldVNodeChildren.forEach((oldVChild, i) => {
          patch(newVNodeChildren[i], el.children[i], oldVChild);
      });
      newVNodeChildren.slice(oldVNodeChildren.length).forEach((unresolvedVNodeChild) => {
          el.appendChild(element(unresolvedVNodeChild));
      });
  };
  const patch = (newVNode, el, prevVNode) => {
      if (!newVNode)
          return el.remove();
      const oldVNode = prevVNode ?? el[OLD_VNODE_FLAG];
      el[OLD_VNODE_FLAG] = newVNode;
      if (oldVNode !== newVNode || oldVNode?.tag !== newVNode?.tag) {
          const newElement = element(newVNode);
          el.replaceWith(newElement);
          return;
      }
      if (typeof oldVNode !== 'string' && typeof newVNode !== 'string' && oldVNode && newVNode) {
          diffProps(el, oldVNode.props, newVNode.props);
          diffChildren(el, oldVNode.children, newVNode.children);
      }
  };

  const _ = undefined;

  exports._ = _;
  exports.element = element;
  exports.h = h;
  exports.patch = patch;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
