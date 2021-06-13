const textInterop = (() => {
  const suite = new Benchmark.Suite();
  let app;
  let output = '';

  const benchmark = suite
    .add('million', {
      setup() {
        document.body.innerHTML = '';
        const el = Million.createElement(Million.m('div', { id: 'app' }));
        document.body.appendChild(el);
        app = el;
      },
      fn() {
        Million.patch(app, Million.m('div', { id: 'app' }, [Date.now()], 1));
      },
    })
    .add('virtual-dom', {
      setup() {
        document.body.innerHTML = '';
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
          [Date.now()],
        );
        const patches = virtualDom.diff(app._, vnode);
        virtualDom.patch(app, patches);
        app._ = vnode;
      },
    })
    .add('vanilla', {
      setup() {
        document.body.innerHTML = '';
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
            [Date.now()],
          ),
        );
        app.replaceWith(el);
        app = el;
      },
    })
    .add('baseline', {
      setup() {
        document.body.innerHTML = '';
        const el = document.createElement('div');
        el.id = 'app';
        document.body.appendChild(el);
        app = el;
      },
      fn() {
        app.textContent = Date.now();
      },
    })
    .on('cycle', ({ target }) => {
      console.log(String(target));
      output += `${String(target)}\n`;
    })
    .on('complete', () => {
      const message = `Fastest is ${benchmark.filter('fastest').map('name')}`;
      console.log(message);
      output += `${message}\n`;
      document.body.innerText = output;
    });

  return () => benchmark.run({ async: true });
})();
