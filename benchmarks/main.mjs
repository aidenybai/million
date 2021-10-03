import 'style.css';

import { m, createElement, style, kebab, patch } from '../src/index';

import appendManyRowsToLargeTable from './suites/appendManyRowsToLargeTable';
import clearRows from './suites/clearRows';
import createManyRows from './suites/createManyRows';
import createRows from './suites/createRows';
import partialUpdate from './suites/partialUpdate';
import removeRow from './suites/removeRow';
import replaceAllRows from './suites/replaceAllRows';
import selectRow from './suites/selectRow';
import swapRows from './suites/swapRows';

const logs = [];
const history = localStorage.logs ? JSON.parse(localStorage.logs) : [];
let disabled = false;

const suites = [
  appendManyRowsToLargeTable,
  clearRows,
  createManyRows,
  createRows,
  partialUpdate,
  removeRow,
  replaceAllRows,
  selectRow,
  swapRows,
].map((suite) =>
  suite
    .on('cycle', (event) => {
      log(event.target);
    })
    .on('complete', () => {
      log(`Fastest is ${suite.filter('fastest').map('name')}`);
      disabled = false;
      patch(el, vnode());
      localStorage.logs = JSON.stringify([...logs, ...history]);
    }),
);

const vnode = () =>
  m('div', undefined, [
    ...suites.map((suite) => {
      const [name, description] = suite.name.split('(');
      return m(
        'button',
        {
          onclick: () => {
            disabled = name;
            logs.unshift([]);
            log(`Running: ${suite.name} - ${new Date().toLocaleString()}`);
            suite.run({ async: true });
            patch(el, vnode());
          },
          style: style({ margin: '5px', opacity: disabled && disabled !== name ? 0.25 : 1 }),
          disabled,
          title: description.slice(0, -1),
        },
        [(disabled === name ? '☑️ ' : '') + name],
      );
    }),

    m('details', { open: logs.length, style: style(kebab({ paddingTop: '20px' })) }, [
      m('summary', undefined, [
        'Logs ',
        m(
          'button',
          {
            onclick: () => {
              logs.length = 0;
              localStorage.logs = JSON.stringify(history);
              patch(el, vnode());
            },
          },
          ['🗑️'],
        ),
      ]),
      m(
        'div',
        { style: style(kebab({ paddingTop: '20px' })) },
        logs.map(
          (logGroup) =>
            logGroup.length && m('pre', undefined, [m('code', undefined, [logGroup.join('\n')])]),
        ),
      ),
    ]),
    history.length
      ? m('details', { style: style(kebab({ paddingTop: '20px', opacity: 0.5 })) }, [
          m('summary', undefined, [
            'History ',
            m(
              'button',
              {
                onclick: () => {
                  history.length = 0;
                  delete localStorage.logs;
                  patch(el, vnode());
                },
              },
              ['🗑️'],
            ),
          ]),
          m(
            'div',
            undefined,
            history.map(
              (logGroup) =>
                logGroup.length &&
                m('pre', undefined, [m('code', undefined, [logGroup.join('\n')])]),
            ),
          ),
        ])
      : '',
  ]);

const el = createElement(vnode());

const log = (message) => {
  logs[0].push(String(message));
  patch(el, vnode());
  console.log(String(message));
};

document.body.appendChild(el);
