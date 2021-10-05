/**
 * @name appendManyRowsToLargeTable
 * @description appending 1,000 to a table of 10,000 rows.
 */

import benchmark from '../benchmark';
import { m, createElement, patch, VFlags, INSERT } from '../../src/index';
import { buildData } from '../data';

const data = buildData(10000);
const oldVNode = m(
  'table',
  undefined,
  data.map(({ id, label }) =>
    m('tr', { key: String(id) }, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
  ),
);
const el = createElement(oldVNode);
data.push(...buildData(1000));
const vnode = m(
  'table',
  undefined,
  data.map(({ id, label }) =>
    m('tr', { key: String(id) }, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
  ),
  VFlags.ONLY_KEYED_CHILDREN,
);

const suite = new benchmark.Suite(
  'append many rows to large table (appending 1,000 to a table of 10,000 rows)',
);

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
    el.cloneNode(true).innerHTML += html;
  });

export default suite;
