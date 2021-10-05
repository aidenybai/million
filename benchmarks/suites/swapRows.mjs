/**
 * @name swapRows
 * @description swap 2 rows for table with 1,000 rows
 */

import benchmark from '../benchmark';
import { m, createElement, patch, VFlags, UPDATE } from '../../src/index';
import { buildData } from '../data';

const data = buildData(1000);
const oldVNode = m(
  'table',
  undefined,
  data.map(({ id, label }) =>
    m('tr', undefined, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
  ),
);
const el = createElement(oldVNode);

const row1 = 0;
const row2 = 1;
const temp = data[row1];
data[row1] = data[row2];
data[row2] = temp;

const vnode = m(
  'table',
  undefined,
  data.map(({ id, label }) =>
    m('tr', undefined, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
  ),
  VFlags.ANY_CHILDREN,
  [UPDATE(row1), UPDATE(row2)],
);

const suite = new benchmark.Suite('swap rows (swap 2 rows for table with 1,000 rows)');

suite
  .add('million', () => {
    patch(el.cloneNode(true), vnode, oldVNode);
  })
  .add('DOM', () => {
    const elClone = el.cloneNode(true);
    const tr1 = elClone.childNodes[row1];
    const tr2 = elClone.childNodes[row2];
    elClone.replaceChild(tr1.cloneNode(true), tr2);
    elClone.replaceChild(tr2.cloneNode(true), tr1);
  })
  .add('innerHTML', () => {
    let html = '';
    data.forEach(({ id, label }) => {
      html += `<tr><td>${String(id)}</td><td>${label}</td></tr>`;
    });
    el.cloneNode(true).innerHTML = html;
  });

export default suite;
