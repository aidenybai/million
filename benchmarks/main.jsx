import 'github-markdown-css/github-markdown.css';
import './style.css';

import { createElement, patch } from '../src/index';
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
const history = localStorage.logs && localStorage.logs.length ? JSON.parse(localStorage.logs) : [];
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

const generateLogMarkdown = () =>
  `Benchmarks compiled on \`${new Date().toLocaleString()}\`\n\n**UA:** ${
    navigator.userAgent
  }\n\n---\n\n${[...logs]
    .map((logGroup) => {
      const logGroupCopy = [...logGroup];
      const title = logGroupCopy.shift();
      return `${title.replace('Running: ', '').split(' - ')[0]}\n\n\`\`\`\n${logGroupCopy.join(
        '\n',
      )}\n\`\`\`\n`;
    })
    .join('\n')}`;

const vnode = () => (
  <div>
    {suites.map((suite) => {
      const [name, description] = suite.name.split('(');
      return (
        <button
          onclick={() => {
            disabled = name;
            logs.unshift([]);
            log(`Running: ${suite.name} - ${new Date().toLocaleString()}`);
            suite.run({ async: true });
            patch(el, vnode());
          }}
          style={{ margin: '5px', opacity: disabled && disabled !== name ? 0.25 : 1 }}
          disabled={disabled}
          title={description.slice(0, -1)}
        >{`${disabled === name ? '☑️ ' : ''}${name}`}</button>
      );
    })}
    <details open={!!logs.length} style={{ paddingTop: '20px' }}>
      <summary key="logs">
        Logs{' '}
        <button
          onclick={() => {
            logs.length = 0;
            localStorage.logs = JSON.stringify(history);
            patch(el, vnode());
          }}
        >
          🗑️
        </button>{' '}
        <button
          onclick={async () => {
            navigator.clipboard.writeText(generateLogMarkdown());
          }}
        >
          📋
        </button>
      </summary>

      <div style={{ paddingTop: '20px' }}>
        {logs.map(
          (logGroup) =>
            logGroup.length && (
              <pre>
                <code>{logGroup.join('\n')}</code>
              </pre>
            ),
        )}
      </div>
    </details>

    {history.length ? (
      <details style={{ paddingTop: '20px', opacity: 0.5 }}>
        <summary key="history">
          History{' '}
          <button
            onclick={() => {
              history.length = 0;
              delete localStorage.logs;
              patch(el, vnode());
            }}
          >
            🗑️
          </button>{' '}
          <button
            onclick={async () => {
              navigator.clipboard.writeText(generateLogMarkdown());
            }}
          >
            📋
          </button>
        </summary>

        <div>
          {history.map(
            (logGroup) =>
              logGroup.length && (
                <pre>
                  <code>{logGroup.join('\n')}</code>
                </pre>
              ),
          )}
        </div>
      </details>
    ) : (
      ''
    )}
  </div>
);

const el = createElement(vnode());

const log = (message) => {
  logs[0].push(String(message));
  patch(el, vnode());
  console.log(String(message));
};

document.body.appendChild(el);
