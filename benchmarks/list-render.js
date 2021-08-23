const listRender = (() => {
  const suite = new Benchmark.Suite();
  let app;
  let output = '<b>list-render:</b><br />';
  let children = [];

  const benchmark = suite
    .add('million', {
      setup() {
        children = [];
        document.body.innerHTML =
          '<b>list-render</b>: Running <code>million</code> benchmarks... (Check console for realtime results)';
        const el = Million.createElement(Million.m('div', { id: 'app' }));
        document.body.appendChild(el);
        app = el;
      },
      fn() {
        children.push(String(Date.now()));
        Million.patch(
          app,
          Million.m('div', { id: 'app' }, [...children], Million.VFlags.ONLY_TEXT_CHILDREN, [
            Million.INSERT(children.length - 1),
          ]),
        );
      },
    })
    .add('virtual-dom', {
      setup() {
        children = [];
        document.body.innerHTML =
          '<b>list-render</b>: Running <code>virtual-dom</code> benchmarks... (Check console for realtime results)';
        const vnode = virtualDom.h('div', {
          id: 'app',
        });
        const el = virtualDom.create(vnode);
        el._ = vnode;
        document.body.appendChild(el);
        app = el;
      },
      fn() {
        children.push(String(Date.now()));
        const vnode = virtualDom.h(
          'div',
          {
            id: 'app',
          },
          [...children],
        );
        const patches = virtualDom.diff(app._, vnode);
        virtualDom.patch(app, patches);
        app._ = vnode;
      },
    })
    .add('vanilla', {
      setup() {
        children = [];
        document.body.innerHTML =
          '<b>list-render</b>: Running <code>vanilla</code> benchmarks... (Check console for realtime results)';
        const el = document.createElement('div');
        el.id = 'app';
        document.body.appendChild(el);
        app = el;
      },
      fn() {
        children.push(String(Date.now()));
        const el = virtualDom.create(
          virtualDom.h(
            'div',
            {
              id: 'app',
            },
            [...children],
          ),
        );

        app.replaceWith(el);
        app = el;
      },
    })
    .add('baseline', {
      setup() {
        children = [];
        document.body.innerHTML =
          '<b>list-render</b>: Running <code>baseline</code> benchmarks... (Check console for realtime results)';
        const el = document.createElement('div');
        el.id = 'app';
        document.body.appendChild(el);
        app = el;
      },
      fn() {
        app.textContent += Date.now();
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
