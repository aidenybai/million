# <a href="https://million.js.org"><img src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/logo.svg" height="69" alt="Million Logo" aria-label="Million Logo" /></a>

简体中文 | [English](./README.md)

### <1kb 专注虚拟 DOM 的编译器。非常快！

当前虚拟 DOM 的实现是不充分的——从过于复杂到被抛弃，如果考虑到不牺牲原始的性能和大小，那么它们大多数都是不可用的。Million 的目标是解决这个问题，提供一个与库无关的 Virtual DOM 作为 Javascript 库的核心，专注于预编译和静态分析。

[![CI](https://img.shields.io/github/workflow/status/aidenybai/million/CI?color=FF524C&labelColor=000&style=flat-square&label=build)](https://img.shields.io/github/workflow/status/aidenybai/million)
![Code Size](https://badgen.net/badgesize/brotli/https/unpkg.com/million/dist/code-size-measurement.js?style=flat-square&label=size&color=FF524C&labelColor=000) [![NPM Version](https://img.shields.io/npm/v/million?style=flat-square&color=FF524C&labelColor=000)](https://www.npmjs.com/package/million) ![Code Coverage](https://img.shields.io/coveralls/github/aidenybai/million?color=FF524C&labelColor=000&style=flat-square)

[**→ 查看 Million 文档**](https://million.js.org)

## 为什么是 Million?

- 🦁 为可编译的库构建
- 📦 轻量级的包大小 (<1kb brotli+min)
- ⚡ 快速运行时操作
- 🛠️ 可扩展使用驱动程序，默认情况下是合理的

## 下载 Million

Million 在默认情况下不需要 [构建工具](https://million.js.org/essentials/installation)的, 但是非常推荐你使用 npm 进行安装

```sh
npm install million
```

## Hello World 示例

下面是一个使用 Million 实现的非常简单的 Hello World 页面。

```js
import { m, createElement, patch } from 'million';

// Initialize app
const app = createElement(m('div', { id: 'app' }, ['Hello World']));
document.body.appendChild(app);
// Patch content
patch(app, m('div', { id: 'app' }, ['Goodbye World']));
```

[**→ 查看更多示例**](https://million.js.org)

## 赞助

<a href="https://vercel.com/?utm_source=millionjs&utm_campaign=oss" target="_blank"><img height="44" src="https://raw.githubusercontent.com/aidenybai/million/main/.github/assets/vercel-logo.svg" alt="Vercel"></a>

**想看到你的 logo 吗？ [→ Million 赞助者](https://github.com/sponsors/aidenybai)**

## 资源 & 反馈

寻找文档？在 [这里](https://million.js.org) 查看。

对 Million 有疑惑？把它贴在 [GitHub Discussions](https://github.com/aidenybai/million/discussions) 并向社区寻求帮助。

发现一个 bug？前往 [issue tracker](https://github.com/aidenybai/million/issues) 我们会尽力帮助你。 我们也欢迎提交 PR。

我们希望所有的 Million 贡献者遵守我们的条款 [Code of Conduct](https://github.com/aidenybai/million/blob/main/.github/CODE_OF_CONDUCT.md)。

[**→ 开始在 GitHub 上贡献代码吧**](https://github.com/aidenybai/million/blob/main/.github/CONTRIBUTING.md)

## 鸣谢

Million 从 [Snabbdom](https://github.com/snabbdom/snabbdom) 和 [Fre](https://github.com/yisar/fre)身上获取了很多灵感，并相信 [React](https://github.com/facebook/react)，[Inferno](https://github.com/infernojs/inferno)以及 [Moon](https://github.com/kbrsh/moon) 背后的核心理念和价值。如果你有兴趣使用其他库，可以随时查看它们。

_为什么叫 "Million"？这个名字源于能够处理 [1M+ ops/sec 基准测试](https://github.com/aidenybai/million/tree/main/benchmarks#readme)的目标_.

## License

Million 是属于 [Aiden Bai](https://github.com/aidenybai) ，并且获得了 [MIT-licensed](LICENSE) 认可的开源软件。
