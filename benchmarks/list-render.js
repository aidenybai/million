const listRender = (() => {
  const suite = new Benchmark.Suite();
  let app;
  let output = '';
  let children = [];

  const benchmark = suite
    .add('million', {
      setup() {
        children = [];
        document.body.innerHTML = '';
        const el = Million.createElement(Million.m('div', { id: 'app' }));
        document.body.appendChild(el);
        app = el;
      },
      fn() {
        children.push(String(Date.now()));
        Million.patch(app, Million.m('div', { id: 'app' }, [...children], 2));
      },
    })
    .add('virtual-dom', {
      setup() {
        children = [];
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
        document.body.innerHTML = '';
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
        document.body.innerHTML = '';
        const el = document.createElement('div');
        el.id = 'app';
        document.body.appendChild(el);
        app = el;
      },
      fn() {
        div.innerText += Date.now();
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
