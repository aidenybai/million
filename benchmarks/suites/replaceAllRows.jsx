/**
 * @name replaceAllRows
 * @description updating all 1,000 rows
 */

import { createElement, patch } from '../../src/index';
import { Suite } from '../benchmark';
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

shuffleArray(data);

const vnode = createVNode();

const suite = Suite('replace all rows (updating all 1,000 rows)', {
  million: () => {
    patch(el(), vnode);
  },
  DOM: () => {
    el().childNodes.forEach((tr, i) => {
      const { id, label } = data[i];
      tr.childNodes[0].textContent = String(id);
      tr.childNodes[1].textContent = label;
    });
  },
  innerHTML: () => {
    let html = '';
    data.forEach(({ id, label }) => {
      html += `<tr><td>${String(id)}</td><td>${label}</td></tr>`;
    });
    el().innerHTML = html;
  },
});

export default suite;
