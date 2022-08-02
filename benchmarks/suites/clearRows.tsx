/**
 * @name clearRows
 * @description clearing a table with 1,000 rows
 */
// @ts-nocheck

import * as hundred from 'hundred';
import { createElement } from 'packages/million';
import * as simple_virtual_dom from 'simple-virtual-dom';
import * as snabbdom from 'snabbdom';
import * as virtual_dom from 'virtual-dom';
import {
  hundredAdapter,
  simpleVirtualDomAdapter,
  snabbdomAdapter,
  Suite,
  millionAdapter,
  virtualDomAdapter,
} from '../benchmark';
import { buildData, patch } from '../data';

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
    patch(el(), millionAdapter(vnode), millionAdapter(oldVNode));
  },
  hundred: () => {
    hundred.patch(el(), hundredAdapter(vnode), hundredAdapter(oldVNode));
  },
  'simple-virtual-dom': () => {
    const patches = simple_virtual_dom.diff(
      simpleVirtualDomAdapter(oldVNode),
      simpleVirtualDomAdapter(vnode),
    );
    simple_virtual_dom.patch(el(), patches);
  },
  'virtual-dom': () => {
    const patches = virtual_dom.diff(
      virtualDomAdapter(oldVNode),
      virtualDomAdapter(vnode),
    );
    virtual_dom.patch(el(), patches);
  },
  snabbdom: () => {
    const patch = snabbdom.init([]);
    patch(snabbdom.toVNode(el()), snabbdomAdapter(vnode));
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
