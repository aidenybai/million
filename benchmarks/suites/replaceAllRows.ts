/**
 * @name replaceAllRows
 * @description updating all 1,000 rows
 */

import { Suite } from 'yet-another-benchmarking-tool';
import { m, createElement, patch, VFlags } from '../../src/index';
import { buildData } from '../data';

const shuffleArray = <T>(array: T[]): void => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const el = document.createElement('table');
const data = buildData(1000);
data.forEach(({ id, label }) => {
  const newId = String(id);
  const row = createElement(
    m('tr', { key: newId }, [m('td', undefined, [newId]), m('td', undefined, [label])]),
  );
  el.appendChild(row);
});

shuffleArray(data);

const suite = new Suite('replace all rows', [
  [
    'million',
    () => {
      patch(
        el,
        m(
          'table',
          undefined,
          data.map(({ id, label }) => {
            const newId = String(id);
            return m('tr', { key: newId }, [
              m('td', undefined, [newId]),
              m('td', undefined, [label]),
            ]);
          }),
          VFlags.ONLY_KEYED_CHILDREN,
        ),
      );
    },
  ],
]);

export default suite;
