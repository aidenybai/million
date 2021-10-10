/**
 * @name clearRows
 * @description clearing a table with 1,000 rows
 */

import { createElement, patch } from '../../src/index';
import { Suite } from '../benchmark';
import { buildData } from '../data';
import * as tiny_vdom from '../tiny-vdom';
import patch as virtual_dom from 'virtual-dom/patch';

const data = buildData(1000);
const oldVNode = (
  <table>
    {data.map(({ id, label }) => (
      <tr key={String(id)}>
        <td>{id}</td>
        <td>{label}</td>
      </tr>
    ))}
  </table>
);
const el = () => createElement(oldVNode);
const vnode = <table></table>;

const suite = Suite('clear rows (clearing a table with 1,000 rows)', {
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
    elClone.childNodes.forEach((child) => elClone.removeChild(child));
  },
  innerHTML: () => {
    el().innerHTML = '';
  },
});

export default suite;
