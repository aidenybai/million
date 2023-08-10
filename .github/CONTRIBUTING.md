# ✨ Contributing Guide

First of all, thank you for taking the time to contribute! 🎉👍

## 💣 Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report 📝, reproduce the behavior 💻, and find related reports. 🔎

Before creating a new issue, **Perform a [cursory search](https://github.com/aidenybai/million/issues)** to see if the report/request has already been raised. If it has, add a comment to the existing issue instead of opening a new one.

> **Note:** If you find a **Closed** issue that seems like it is the same thing that you're experiencing, open a new issue and include a link to the original issue in the body of your new one.

If you are unable to find an open or closed issue addressing the problem, [open a new one](https://github.com/aidenybai/million/issues). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

### How Do I Submit A (Good) Bug Report?

Explain the problem and include additional details to help maintainers reproduce the problem:

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps which reproduce the problem** in as many details as possible.
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
- **Explain which behavior you expected to see instead and why.**
- **Include screenshots or animated GIFs** which show you following the described steps and clearly demonstrate the problem. If you use the keyboard while following the steps, use [this tool](https://www.cockos.com/licecap/) to record GIFs on macOS and Windows, and [this tool](https://github.com/colinkeenan/silentcast) or [this tool](https://gitlab.gnome.org/Archive/byzanz) on Linux.

## 🛠 Suggesting Enhancements

Feature requests are tracked as [GitHub issues](https://guides.github.com/features/issues/). Create an issue on that repository and provide the following information:

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a in detail description of the suggested enhancement** in as many details as possible.
- **Explain why this enhancement would be useful** to the project and the community.

## 📝 Cloning the project & creating PR

### Fork the repository.

Click on the fork button on the top of the page. This will create a copy of this repository in your account. Or click [here](https://github.com/aidenybai/million/fork).

### Clone the forked repository.

```bash
 git clone https://github.com/<your-username>/million.git
```

or if use the Github CLI

```bash
gh repo clone <your-username>/million
```

### Navigate to the project directory.

```bash
cd million
```

### Create a new branch (naming convention: type-description-issueNo)

Kindly give your branch a more descriptive name like `docs-contributing-guide-2` instead of `patch-1`.

You could follow this convention. Some ideas to get you started:

- Feature Updates: `feat-<brief 2-3 words-Description>-<ISSUE_NO>`
- Bug Fixes: `fix-<brief 2-3 words-Description>-<ISSUE_NO>`
- Documentation: `docs-<brief 2-3 words-Description>-<ISSUE_NO>`
- And so on...

To create a new branch, use the following command:

```bash
git checkout -b your-branch-name
```

### Make the necessary changes.

### Stage your changes and commit.

```bash
git add . # Stages all the changes
git commit -m "<your_commit_message>"
```

Your commit message should be something which gives concise idea of the issue you are solving.

We implement the Conventional Commits specification for commit messages. This specification is a lightweight convention on top of commit messages. It provides an easy set of rules for creating an explicit commit history; which makes it easier to write automated tools on top of. This convention dovetails with SemVer, by describing the features, fixes, and breaking changes made in commit messages.

The commit message should be structured as follows:

```
<type>(optional scope): <description>
```

Before you push your local commits to the remote repository.

```bash
pnpm cleanup
pnpm lint
pnpm test
```

Push your local commits to the remote repository.

```bash
git push origin your-branch-name
```

**8.** Create a new [pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request) from `your-branch-name`

🎉 Congratulations! You've made your first pull request! Now, you should just wait until the maintainers review your pull request.

## ✨ Understanding the project

## Prerequites

This project uses [pnpm](https://pnpm.io/) as its package manager. If you had [NodeJS](https://nodejs.org/en) (node 20.x upwards has a couple of issues) installed, this is how you can install [pnpm](https://pnpm.io/) globally:

```
npm i -g pnpm
```

The project uses a [monorepo](https://monorepo.tools/) structure. It is divided into 3 main folders:

- `packages` - This folder contains all the packages used within the Million.js library
- `test` - This folder contains all the tests written for the Million.js library
- `website` - This folder contains the code for the website [Million.js](https://million.dev/)

### `packages` folder

The `packages` folder contains all the code related to the Million.js package. The package is built using Typescript.

The source code is divided into five main folders:

- `compiler` - This folder contains all the code related to the Million.js React and Next.js compilers
- `jsx-runtime` - This folder contains the code related to the runtime code for jsx.
- `million` - This folder contains the code for the core Million.js package. The implementation of the optimized array rendering (`<For/>`), `block()` and virtual DOM for React are in here.
- `next` - This folder contains the Million.js support package for Next.js
- `react` - This folder contains the Million.js support package for React

To run the project locally, you need to install the dependencies.

```bash
pnpm install # Install dependencies
cd website  # Takes you to the website mono-repo
pnpm run dev # Run the project
```

### `test` folder

This folder contains the code for the tests for the implementation of core Million.js features like the "map-array" with `<For/>, `block() and so on. The test use the [Vitest](https://vitest.dev/).

To run the test locally:

```bash
pnpm install # Install dependencies
pnpm run test # Run all tests
```

### `website` folder

This folder contains the code for the Million.js website built with [Nextra](https://nextra.site/) a framework that allows you to build static websites with [NextJS](https://nextjs.org/) and [MDX.](https://mdxjs.com/)

The source code is divided into two main folders:

- `pages` - This folder contains all the pages of the website.
- `components` - This folder contains all the components of the website.
- `styles` - This folder contains all the styles of the website

It is suggested you to read the [Nextra](https://nextra.site/) to understand the project structure.

To run the website locally, you need to install the dependencies and run the development server:

```bash
pnpm install # Install dependencies
pnpm run dev # Run the development server
```

## Create A Dev Playground

To test your changes on Million locally, make sure you have an already existing [React.js](https://react.dev/learn/start-a-new-react-project) or [Next.js](https://nextjs.org/docs) project. Open your local project and do the following:

- Go to the parts of your project where you are importing Million and then change the paths to absolute paths that are links to the Million.js codebase you have on your machine. For example:

  ```
  import {block} from "/home/tobiloba/Desktop/million/react"
  ```

_The template for this contributing guideline was copied from [FrancescoXX/4c-site](https://github.com/FrancescoXX/4c-site). Thank you for the amazing guidelines._
