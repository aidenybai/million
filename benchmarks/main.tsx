// @ts-nocheck

import { createElement, patch, render } from 'packages/million';
import Chart from 'chart.js/auto';
import confetti from 'canvas-confetti';
import { camelCase } from 'lodash';

import appendManyRowsToLargeTable from './suites/appendManyRowsToLargeTable';
import clearRows from './suites/clearRows';
import createManyRows from './suites/createManyRows';
import createRows from './suites/createRows';
import partialUpdate from './suites/partialUpdate';
import removeRow from './suites/removeRow';
import replaceAllRows from './suites/replaceAllRows';
import selectRow from './suites/selectRow';
import swapRows from './suites/swapRows';

if (
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )
) {
  alert(
    'Please note that these benchmarks will be degraded and inaccurate on mobile. Usage is experimental on mobile devices and is not guaranteed to be functional or stable, proceed with caution.',
  );
}

const cumulative = {
  million: 0,
  hundred: 0,
  'simple-virtual-dom': 0,
  'virtual-dom': 0,
  snabbdom: 0,
  DOM: 0,
  innerHTML: 0,
};
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
      celebration();
      chart.data.datasets[0].backgroundColor = [
        'rgba(182, 216, 169, 1)',
        'rgba(182, 216, 169, 1)',
        'rgba(215, 227, 184, 1)',
        'rgba(255, 242, 204, 1)',
        'rgba(247, 211, 186, 1)',
        'rgba(240, 178, 169, 1)',
        'rgba(234, 153, 153, 1)',
      ];
      chart.update();
    }),
);
const vnode = () => {
  return (
    <div>
      <div>
        {suites.map((suite) => {
          const [name, description] = suite.name.split('(');
          return (
            <a
              role="button"
              href="#"
              onclick={(event) => {
                const modal = document.getElementById('modal');
                event.preventDefault();
                modal.open = true;
                render(
                  modal.querySelector('article'),
                  <div>
                    <h2>{name}</h2>
                    <p>{description.slice(0, -1)}</p>
                    <p>
                      <a
                        href={`https://github.com/aidenybai/million/blob/main/benchmarks/suites/${camelCase(
                          name,
                        )}.tsx`}
                      >
                        <b>→ View Source Code</b>
                      </a>
                    </p>
                    <p>
                      <details>
                        <summary>Benchmark Config</summary>
                        <pre>
                          <code>{JSON.stringify(suite, null, 2)}</code>
                        </pre>
                      </details>
                    </p>
                    <footer>
                      <button
                        role="button"
                        data-target="modal"
                        onClick={() =>
                          document
                            .getElementById('modal')
                            .removeAttribute('open')
                        }
                      >
                        Understood
                      </button>
                    </footer>
                  </div>,
                );
                disabled = name;
                log(`Running: ${suite.name} - ${new Date().toLocaleString()}`);
                chart.data.datasets[0].backgroundColor = new Array(7).fill(
                  'rgba(0, 0, 0, 0.2)',
                );
                chart.update();
                suite.run({ async: true });
                patch(el, vnode());
              }}
              style={{
                margin: '5px',
                opacity: disabled && disabled !== name ? 0.25 : 1,
                pointerEvents: disabled ? 'none' : 'auto',
              }}
              disabled={disabled}
            >{`${disabled === name ? '☑️ ' : ''}${name}`}</a>
          );
        })}
      </div>

      <br />

      <details open={true}>
        <summary>Graph (Cumulative)</summary>
        <canvas id="viz" width="400" height="200"></canvas>
      </details>
    </div>
  );
};

const el = createElement(vnode());

const log = (message) => {
  if (message.name) cumulative[message.name] += Math.round(message.hz);
  patch(el, vnode());
  console.log(String(message));
  const sortedKeys = Object.keys(cumulative).sort(
    (a, b) => cumulative[b] - cumulative[a],
  );
  const sortedValues = sortedKeys.map((key) => cumulative[key]);
  chart.data.labels = sortedKeys;
  chart.data.datasets[0].data = sortedValues;
  chart.update();
};

document.getElementById('loading').replaceWith(el);

const ctx = document.getElementById('viz');
const chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: Object.keys(cumulative),
    datasets: [
      {
        label: 'operations/second',
        data: Object.values(cumulative),
        backgroundColor: new Array(7).fill('rgba(0, 0, 0, 0.2)'),
        borderColor: new Array(7).map(() => 'rgb(0, 0, 0)'),
        borderWidth: 1,
      },
    ],
  },
  options: {
    indexAxis: 'x',
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});
chart.options.animation = false;

const fire = (particleRatio: number, opts: Record<string, number>) => {
  confetti(
    Object.assign(
      {},
      {
        origin: { y: 0.7 },
      },
      opts,
      {
        particleCount: Math.floor(200 * particleRatio),
      },
    ),
  );
};

const celebration = () => {
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};
