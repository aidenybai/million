/**
 * @name selectRow
 * @description highlighting a selected row
 */

import benchmark from '../benchmark';
import { m, createElement, patch, VFlags, style } from '../../src/index';
import { buildData } from '../data';

const data = buildData(1000);
const oldVNode = m(
  'table',
  undefined,
  data.map(({ id, label }) =>
    m('tr', { key: String(id), style: style({ background: '' }) }, [
      m('td', undefined, [String(id)]),
      m('td', undefined, [label]),
    ]),
  ),
);
const el = createElement(oldVNode);
const row = Math.floor(Math.random() * (data.length + 1));
const vnode = m(
  'table',
  undefined,
  data.map(({ id, label }, i) =>
    m('tr', { key: String(id), style: style({ background: row === i ? 'red' : '' }) }, [
      m('td', undefined, [String(id)]),
      m('td', undefined, [label]),
    ]),
  ),
  VFlags.ONLY_KEYED_CHILDREN,
);

const suite = new benchmark.Suite('select row (highlighting a selected row)');

suite
  .add('million', () => {
    patch(el.cloneNode(true), vnode, oldVNode);
  })
  .add('DOM', () => {
    el.cloneNode(true).childNodes[row].style.background = 'red';
  })
  .add('innerHTML', () => {
    let html = '';
    data.forEach(({ id, label }, i) => {
      if (row === i)
        return (html += `<tr style="background: red;"><td>${id}</td><td>${label}</td></tr>`);
      html += `<tr><td>${String(id)}</td><td>${label}</td></tr>`;
    });
    el.cloneNode(true).innerHTML = html;
  });

export default suite;
