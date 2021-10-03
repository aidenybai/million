/**
 * @name clearRows
 * @description clearing a table with 1,000 rows
 */

import benchmark from '../benchmark';
import { m, createElement, patch, VFlags } from '../../src/index';
import { buildData } from '../data';

const el1 = createElement(m('table'));
const data1 = buildData(10000);
data1.forEach(({ id, label }) => {
  const newId = String(id);
  const row = createElement(
    m('tr', { key: newId }, [m('td', undefined, [newId]), m('td', undefined, [label])]),
  );
  el1.appendChild(row);
});

const el2 = document.createElement('table');
const data2 = buildData(10000);
data2.forEach(({ id, label }) => {
  const newId = String(id);
  const row = createElement(
    m('tr', { key: newId }, [m('td', undefined, [newId]), m('td', undefined, [label])]),
  );
  el2.appendChild(row);
});

const suite = new benchmark.Suite('clear rows (clearing a table with 1,000 rows)');

const hoistedVNode = m('table', undefined, [], VFlags.NO_CHILDREN);

suite
  .add('million', () => {
    patch(el1, hoistedVNode);
  })
  .add('vanilla', () => {
    el2.childNodes.forEach((node) => el2.removeChild(node));
  });

export default suite;
