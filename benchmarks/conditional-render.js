const conditionalRender = (() => {
  const suite = new Benchmark.Suite();
  let app;
  let output = '<b>conditional-render:</b><br />';

  const benchmark = suite
    .add('million', {
      setup() {
        document.body.innerHTML =
          '<b>conditional-render</b>: Running <code>million</code> benchmarks... (Check console for realtime results)';
        const el = Million.createElement(Million.m('div', { id: 'app' }));
        document.body.appendChild(el);
        app = el;
      },
      fn() {
        const timestamp = Date.now();
        const hasChildren = timestamp % 2 === 0;
        Million.patch(
          app,
          Million.m(
            'div',
            { id: 'app' },
            hasChildren ? [String(timestamp)] : undefined,
            hasChildren ? Million.VFlags.ONLY_TEXT_CHILDREN : Million.VFlags.NO_CHILDREN,
          ),
        );
      },
    })
    .add('virtual-dom', {
      setup() {
        document.body.innerHTML =
          '<b>conditional-render</b>: Running <code>virtual-dom</code> benchmarks... (Check console for realtime results)';
        const vnode = virtualDom.h('div', {
          id: 'app',
        });
        const el = virtualDom.create(vnode);
        el._ = vnode;
        document.body.appendChild(el);
        app = el;
      },
      fn() {
        const vnode = virtualDom.h(
          'div',
          {
            id: 'app',
          },
          Date.now() % 2 === 0 ? [Date.now()] : [],
        );
        const patches = virtualDom.diff(app._, vnode);
        virtualDom.patch(app, patches);
        app._ = vnode;
      },
    })
    .add('vanilla', {
      setup() {
        document.body.innerHTML =
          '<b>conditional-render</b>: Running <code>vanilla</code> benchmarks... (Check console for realtime results)';
        const el = document.createElement('div');
        el.id = 'app';
        document.body.appendChild(el);
        app = el;
      },
      fn() {
        const el = virtualDom.create(
          virtualDom.h(
            'div',
            {
              id: 'app',
            },
            Date.now() % 2 === 0 ? [String(Date.now())] : [],
          ),
        );
        app.replaceWith(el);
        app = el;
      },
    })
    .add('baseline', {
      setup() {
        document.body.innerHTML =
          '<b>conditional-render</b>: Running <code>baseline</code> benchmarks... (Check console for realtime results)';
        const el = document.createElement('div');
        el.id = 'app';
        document.body.appendChild(el);
        app = el;
      },
      fn() {
        app.textContent = Date.now() % 2 === 0 ? [Date.now()] : null;
      },
    })
    .on('cycle', ({ target }) => {
      console.log(String(target));
      output += `${String(target)}<br />`;
    })
    .on('complete', () => {
      const message = `<i>Fastest is <b>${benchmark
        .filter('fastest')
        .map('name')
        .join(', ')}</b></i>`;
      console.log(message);
      output += `${message}<br /><br />`;
      output += `<button onclick="window.location.reload()">Reload</button><br />`;
      document.body.innerHTML = output;
    });

  return () => benchmark.run({ async: true });
})();
