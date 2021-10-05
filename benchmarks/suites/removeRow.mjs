/**
 * @name removeRow
 * @description removing one row
 */

import benchmark from '../benchmark';
import { m, createElement, patch, VFlags, DELETE } from '../../src/index';
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
const row = Math.floor(Math.random() * (data.length + 1));

const vnode = m(
  'table',
  undefined,
  data.map(({ id, label }) =>
    m('tr', undefined, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
  ),
  VFlags.ONLY_KEYED_CHILDREN,
  [DELETE(row)],
);

const suite = new benchmark.Suite('remove row (removing one row)');

suite
  .add('million', () => {
    patch(el.cloneNode(true), vnode, oldVNode);
  })
  .add('DOM', () => {
    const elClone = el.cloneNode(true);
    elClone.removeChild(elClone.childNodes[row]);
  })
  .add('innerHTML', () => {
    let html = '';
    data.forEach(({ id, label }, i) => {
      if (row === i) return;
      html += `<tr><td>${String(id)}</td><td>${label}</td></tr>`;
    });
    el.cloneNode(true).innerHTML = html;
  });

export default suite;
