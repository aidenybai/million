/**
 * @name swapRows
 * @description swap 2 rows for table with 1,000 rows
 */

import { Suite } from '../benchmark';
import { m, createElement, patch, VFlags, UPDATE } from '../../src/index';
import { buildData } from '../data';

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

const row1 = 0;
const row2 = 1;
const temp = data[row1];
data[row1] = data[row2];
data[row2] = temp;

const vnode = (
  <table delta={[UPDATE(row1), UPDATE(row2)]}>
    {data.map(({ id, label }) => (
      <tr>
        <td>{id}</td>
        <td>{label}</td>
      </tr>
    ))}
  </table>
);

const suite = Suite('swap rows (swap 2 rows for table with 1,000 rows)', {
  million: () => {
    patch(el(), vnode);
  },
  DOM: () => {
    const elClone = el();
    const tr1 = elClone.childNodes[row1];
    const tr2 = elClone.childNodes[row2];
    elClone.replaceChild(tr1.cloneNode(true), tr2);
    elClone.replaceChild(tr2.cloneNode(true), tr1);
  },
  innerHTML: () => {
    let html = '';
    data.forEach(({ id, label }) => {
      html += `<tr><td>${String(id)}</td><td>${label}</td></tr>`;
    });
    el().innerHTML = html;
  },
});

export default suite;
