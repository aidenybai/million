/**
 * @name removeRow
 * @description removing one row
 */

import { createElement, DELETE, patch } from '../../src/index';
import { Suite } from '../benchmark';
import { buildData } from '../data';
import * as tiny_vdom from '../tiny-vdom';
import patch as virtual_dom from 'virtual-dom/patch';

const data = buildData(1000);
const oldVNode = (
  <table>
    {data.map(({ id, label }) => (
      <tr>
        <td>{id}</td>
        <td>{label}</td>
      </tr>
    ))}
  </table>
);
const el = () => createElement(oldVNode);
const row = Math.floor(Math.random() * (data.length + 1));
data.splice(row, 1);

const vnode = (
  <table delta={[DELETE(row)]}>
    {data.map(({ id, label }) => (
      <tr>
        <td>{id}</td>
        <td>{label}</td>
      </tr>
    ))}
  </table>
);

const suite = Suite('remove row (removing one row)', {
  million: () => {
    patch(el(), vnode);
  },
  'tiny-vdom': () => {
    tiny_vdom.patch(el(), vnode, oldVNode);
  },
  'virtual-dom': () => {
    virtual_dom.patch(el(), vnode, oldVNode);
  },
  DOM: () => {
    const elClone = el();
    elClone.removeChild(elClone.childNodes[row]);
  },
  innerHTML: () => {
    let html = '';
    data.forEach(({ id, label }, i) => {
      if (row === i) return;
      html += `<tr><td>${String(id)}</td><td>${label}</td></tr>`;
    });
    el().innerHTML = html;
  },
});

export default suite;
