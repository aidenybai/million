/**
 * @name replaceAllRows
 * @description updating all 1,000 rows
 */

import benchmark from '../benchmark';
import { m, createElement, patch, VFlags } from '../../src/index';
import { buildData } from '../data';

const shuffleArray = (array) => {
  for (
    let i = array.length - 1 - Math.floor(Math.random() * (data.length / 3 + 1));
    i > Math.floor(Math.random() * (data.length / 3 + 1));
    i--
  ) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const data = buildData(1000);
const oldVNode = m(
  'table',
  undefined,
  data.map(({ id, label }) =>
    m('tr', { key: String(id) }, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
  ),
);
const el = createElement(oldVNode);

shuffleArray(data);

const vnode = m(
  'table',
  undefined,
  data.map(({ id, label }) =>
    m('tr', { key: String(id) }, [m('td', undefined, [String(id)]), m('td', undefined, [label])]),
  ),
  VFlags.ONLY_KEYED_CHILDREN,
);

const suite = new benchmark.Suite('replace all rows (updating all 1,000 rows)');

suite
  .add('million', () => {
    patch(el.cloneNode(true), vnode, oldVNode);
  })
  .add('DOM', () => {
    el.cloneNode(true).childNodes.forEach((tr, i) => {
      const { id, label } = data[i];
      tr.childNodes[0].textContent = String(id);
      tr.childNodes[1].textContent = label;
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
