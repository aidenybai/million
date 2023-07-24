# eslint-plugin-millionjs

## Overview

`eslint-plugin-millionjs` is an ESLint plugin specifically designed for the MillionJS Library. This plugin provides a set of rules to help you maintain consistent and error-free code when working with projects integrated with Million. It can automatically detect potential issues, enforce best practices, and improve code quality in your MillionJS applications.

## Installation

To use `eslint-plugin-millionjs` in your MillionJS project, you'll need to install it along with its peer dependencies:

To run it Locally

```bash
npm i file:<PLUGIN_DIRECTORY> -D
```

```bash
npm install eslint-plugin-millionjs eslint@^7.0.0 --save-dev
```

```bash
npm install eslint-plugin-millionjs eslint@^7.0.0 --save-dev
```

Or, if you prefer using Yarn:

```bash
yarn add eslint-plugin-millionjs eslint@^7.0.0 --dev
```

## Configuration

After installation, you need to add `millionjs` to the `plugins` section of your ESLint configuration file (e.g., `.eslintrc.js`):

```javascript
module.exports = {
  plugins: ['millionjs'],
  // Other ESLint configurations...
};
```

## Usage

Once you've added `millionjs` to your ESLint configuration, you can now enable specific rules provided by the plugin or modify their severity according to your project's needs.

Here's an example of how to enable the `avoid-spread-attributes` rule from `eslint-plugin-millionjs` and set it to "error":

```javascript
module.exports = {
  plugins: ['millionjs'],
  rules: {
    'millionjs/avoid-spread-attributes': 'error',
  },
  // Other ESLint configurations...
};
```

## Rules

`eslint-plugin-millionjs` provides the following rules:

- `millionjs/no-unused-components`: This rule helps identify unused components in your MillionJS project, ensuring you remove any unnecessary components that might increase the bundle size.

- `millionjs/strict-import-order`: This rule enforces a strict import order within your MillionJS application, ensuring a consistent and organized import structure.

## Running ESLint

To run ESLint with the `eslint-plugin-millionjs` rules, you can use the following command:

```bash
npx eslint --ext .js,.jsx,.ts,.tsx src/
```

Adjust the `src/` part to the directory or files you want to lint.

## Conclusion

With `eslint-plugin-millionjs`, you can ensure code consistency, maintainability, and adherence to best practices in your projects integrated with Million. The plugin's rules help catch potential issues early on and enhance the overall code quality. Feel free to explore the available rules and adjust the configuration to suit your project's specific needs.

For more information about MillionJS and its ecosystem, please refer to the official documentation: [https://million.dev/](https://million.dev/).
