/**
 * @name selectRow
 * @description highlighting a selected row
 */

import { createElement, patch } from '../../src/index';
import { Suite, clone } from '../benchmark';
import { buildData } from '../data';
import * as tiny_vdom from '../tiny-vdom';
import * as virtual_dom from 'virtual-dom';
import * as snabbdom from 'snabbdom';

const data = buildData(1000);
const createVNode = () => (
  <table>
    {data.map(({ id, label }) => (
      <tr key={String(id)}>
        <td>{id}</td>
        <td>{label}</td>
      </tr>
    ))}
  </table>
);
const oldVNode = createVNode();
const el = () => createElement(oldVNode);
const row = Math.floor(Math.random() * (data.length + 1));
const vnode = createVNode();

const suite = Suite('select row (highlighting a selected row)', {
  million: () => {
    patch(el(), vnode);
  },
  'tiny-vdom': () => {
    tiny_vdom.patch(el(), clone(oldVNode), clone(oldVNode));
  },
  'virtual-dom': () => {
    const patches = virtual_dom.diff(clone(oldVNode), clone(vnode));
    virtual_dom.patch(el(), patches);
  },
  snabbdom: () => {
    const patch = snabbdom.init([snabbdom.propsModule]);
    patch(el(), clone(vnode));
  },
  DOM: () => {
    el().childNodes[row].style.background = 'red';
  },
  innerHTML: () => {
    let html = '';
    data.forEach(({ id, label }, i) => {
      if (row === i)
        return (html += `<tr style="background: red;"><td>${id}</td><td>${label}</td></tr>`);
      html += `<tr><td>${String(id)}</td><td>${label}</td></tr>`;
    });
    el().innerHTML = html;
  },
});

export default suite;
