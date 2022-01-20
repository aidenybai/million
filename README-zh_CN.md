<a href="https://million.js.org">
  <img src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/banner.svg" />
</a>

[![CI](https://img.shields.io/github/workflow/status/aidenybai/million/CI?color=9765e1&labelColor=000&style=flat-square&label=build)](https://img.shields.io/github/workflow/status/aidenybai/million)
![Code Size](https://badgen.net/badgesize/brotli/https/unpkg.com/million/dist/code-size-measurement.js?style=flat-square&label=size&color=9765e1&labelColor=000) [![NPM Version](https://img.shields.io/npm/v/million?style=flat-square&color=9765e1&labelColor=000)](https://www.npmjs.com/package/million) ![Code Coverage](https://img.shields.io/coveralls/github/aidenybai/million?color=9765e1&labelColor=000&style=flat-square)

## 什么是 Million?

中文 | [English](https://github.com/aidenybai/million/blob/main/README.md)

### <1kb 专注于编译器的虚拟 DOM - 速度非常快！

当前虚拟 DOM 的实施功效并没有充分发挥出来。有些过于复杂而限制其有效地实施；有些则半途而废。如果不牺牲其初始性能和规模，其中大多数实际上是不可用的。大多要以牺牲性能和大小为代价进行调整，才变得可用。Million 就是针对这个问题的一套解决方案。它提供了一个与库无关的虚拟 DOM 作为 Javascript 库的核心，专注于预编译和静态分析。

[**→ 查看 Million 文档**](https://million.js.org)

## 为什么选择 Million?

- 🦁 构建可编译的库
- 📦 轻量级的模块 (<1kb brotli+min)
- ⚡ 快捷的运行操作
- 🛠️ 可以使用驱动程序进行组合，默认情况下就可实现

## 下载 Million

Million 在默认情况下不需要 [构建工具](https://million.js.org/essentials/installation), 但是非常推荐你使用 npm 进行安装

```sh
npm install million
```

## 开始

下面是一个使用 Million 实现的极简 Counter 页面。

```js
import { m, createElement, patch } from 'million';

const view = (seconds) => m('p', undefined, [`Time elapsed: ${seconds}`]);

const el = createElement(view(0));

let seconds = 0;

setInterval(() => {
  patch(el, view(seconds));
  seconds++;
}, 1000);

document.body.appendChild(el);
```

`patch()` 函数有一个标准接口，用于许多虚拟 DOM 库。 第一个参数是将用作实时 DOM 引用的 DOM 节点，第二个参数是要渲染的虚拟 DOM。

`createElement()` 函数将“虚拟 DOM”节点转换为真正的 DOM 节点。

`m()` 函数将为元素实例化一个“虚拟 DOM”节点。

[**→ 查看示例**](https://million.js.org/docs/getting-started#quick-start)

## 赞助

<a href="https://vercel.com/?utm_source=millionjs&utm_campaign=oss" target="_blank"><img height="44" src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/vercel-logo.svg" alt="Vercel"></a>

**想在这里看到你的 logo 吗？ [→ Million 赞助者](https://github.com/sponsors/aidenybai)**

## 资源 & 反馈

寻找文档？在 [这里](https://million.js.org) 查看。

对 Million 有疑惑？把它贴在 [GitHub Discussions](https://github.com/aidenybai/million/discussions) 并向社区寻求帮助。

发现一个 bug？前往 [issue tracker](https://github.com/aidenybai/million/issues) 我们会尽力帮助你。 我们也欢迎提交 PR。

我们希望所有的 Million 贡献者遵守我们的条款 [Code of Conduct](https://github.com/aidenybai/million/blob/main/.github/CODE_OF_CONDUCT.md)。

[**→ 开始在 GitHub 上贡献代码吧**](https://github.com/aidenybai/million/blob/main/.github/CONTRIBUTING.md)

## 鸣谢

Million 从[snabbdom](https://github.com/snabbdom/snabbdom), [ivi](https://github.com/localvoid/ivi), [mikado](https://github.com/nextapps-de/mikado)，[等等](https://krausest.github.io/js-framework-benchmark/2021/table_chrome_96.0.4664.45.html) 身上获取了很多灵感。如果你有兴趣使用其他库，可以随时查看它们。

_为什么叫 "Million"？这个名字源于能够处理的目标 [1M+ ops/sec 基准测试](https://github.com/aidenybai/million/tree/main/benchmarks#readme)_.

## 许可证

Million 是属于 [Aiden Bai](https://github.com/aidenybai)，并且获得了 [MIT-licensed](LICENSE) 认可的开源软件。

![View count](https://hits.link/hits?url=https://github.com/aidenybai/million)
