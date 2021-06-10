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
        children.push(Million.m('div', { key: 'foo' }, [String(Date.now())]));
        Million.patch(app, Million.m('div', { id: 'app' }, [...children]));
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
        children.push(virtualDom.h('div', {}, String(Date.now())));
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
        const div = document.createElement('div');
        div.textContent = Date.now();
        app.appendChild(div);
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
