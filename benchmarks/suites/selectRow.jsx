/**
 * @name selectRow
 * @description highlighting a selected row
 */

import { createElement, patch } from '../../src/index';
import { Suite } from '../benchmark';
import { buildData } from '../data';

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
