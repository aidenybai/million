/**
 * @name clearRows
 * @description clearing a table with 1,000 rows
 */

import benchmark from '../benchmark';
import { m, createElement, patch, VFlags } from '../../src/index';
import { buildData } from '../data';

const data = buildData(1000);
const oldVNode = m(
  'table',
  undefined,
  data.map(({ id, label }) =>
    m('tr', { key: String(id) }, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
  ),
);
const el = createElement(oldVNode);
const vnode = m('table', undefined, [], VFlags.NO_CHILDREN);

const suite = new benchmark.Suite('clear rows (clearing a table with 1,000 rows)');

suite
  .add('million', () => {
    patch(el.cloneNode(true), vnode, oldVNode);
  })
  .add('DOM', () => {
    const elClone = el.cloneNode(true);
    elClone.childNodes.forEach((child) => elClone.removeChild(child));
  })
  .add('innerHTML', () => {
    el.cloneNode(true).innerHTML = '';
  });

export default suite;
