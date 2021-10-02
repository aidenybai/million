/**
 * @name replaceAllRows
 * @description updating all 1,000 rows
 */

import benchmark from '../benchmark';
import { m, createElement, patch, VFlags } from '../../src/index';
import { buildData } from '../data';

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const el1 = document.createElement('table');
const data1 = buildData(2 << 15);
data1.forEach(({ id, label }) => {
  const newId = String(id);
  const row = createElement(
    m('tr', { key: newId }, [m('td', undefined, [newId]), m('td', undefined, [label])]),
  );
  el1.appendChild(row);
});

shuffleArray(data1);

const el2 = document.createElement('table');
const data2 = buildData(2 << 15);
data2.forEach(({ id, label }) => {
  const tr = document.createElement('tr');
  const td1 = document.createElement('td');
  const td2 = document.createElement('td');
  td1.textContent = String(id);
  td2.textContent = label;
  tr.appendChild(td1);
  tr.appendChild(td2);
  el2.appendChild(tr);
});

shuffleArray(data2);

const suite = new benchmark.Suite('replace all rows');

suite
  .add('million', () => {
    patch(
      el1,
      m(
        'table',
        undefined,
        data1.map(({ id, label }) => {
          const newId = String(id);
          return m('tr', { key: newId }, [
            m('td', undefined, [newId]),
            m('td', undefined, [label]),
          ]);
        }),
        VFlags.ONLY_KEYED_CHILDREN,
      ),
    );
  })
  .add('vanilla', () => {
    el2.childNodes.forEach((tr, i) => {
      const newId = String(data2[i].id);
      tr.childNodes[0].textContent = newId;
      tr.childNodes[1].textContent = data2[i].label;
    });
  });

export default suite;
