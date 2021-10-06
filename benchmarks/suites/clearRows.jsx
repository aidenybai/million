/**
 * @name clearRows
 * @description clearing a table with 1,000 rows
 */

import { createElement, patch } from '../../src/index';
import { Suite } from '../benchmark';
import { buildData } from '../data';

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
  DOM: () => {
    const elClone = el();
    elClone.childNodes.forEach((child) => elClone.removeChild(child));
  },
  innerHTML: () => {
    el().innerHTML = '';
  },
});

export default suite;
