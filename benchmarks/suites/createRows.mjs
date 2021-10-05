/**
 * @name createRows
 * @description creating 1,000 rows
 */

import benchmark from '../benchmark';
import { m, createElement, patch, VFlags } from '../../src/index';
import { buildData } from '../data';

const data = buildData(10000);
const oldVNode = m('table');
const el = createElement(oldVNode);
const vnode = m(
  'table',
  undefined,
  data.map(({ id, label }) =>
    m('tr', undefined, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
  ),
);

const suite = new benchmark.Suite('create rows (creating 1,000 rows)');

suite
  .add('million', () => {
    patch(el.cloneNode(true), vnode, oldVNode);
  })
  .add('DOM', () => {
    const elClone = el.cloneNode(true);
    data.forEach(({ id, label }) => {
      const tr = document.createElement('tr');
      const td1 = document.createElement('td');
      const td2 = document.createElement('td');
      td1.textContent = String(id);
      td2.textContent = label;
      tr.appendChild(td1);
      tr.appendChild(td2);
      elClone.appendChild(tr);
    });
  })
  .add('innerHTML', () => {
    let html = '';
    data.forEach(({ id, label }) => {
      html += `<tr><td>${String(id)}</td><td>${label}</td></tr>`;
    });
    el.cloneNode(true).innerHTML = html;
  });

export default suite;
