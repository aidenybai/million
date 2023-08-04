# eslint-plugin-millionjs

## Overview

`eslint-plugin-millionjs` is an ESLint plugin specifically designed for the MillionJS Library. This plugin provides a set of rules to help you maintain consistent and error-free code when working with projects integrated with Million. It can automatically detect potential issues, enforce best practices, and improve code quality in your MillionJS applications.

## Installation

To use `eslint-plugin-millionjs` in your MillionJS project, you'll need to install it along with its peer dependencies:

To run it from the NPM Registry

```bash
npm install eslint-plugin-millionjs eslint@^7.0.0 eslint-plugin-react --save-dev
```

Or, if you prefer using Yarn:

```bash
yarn add eslint-plugin-millionjs eslint@^7.0.0 eslint-plugin-react --dev
```

## Configuration

After installation, you need to add `millionjs` to the `plugins` section of your ESLint configuration file (e.g., `.eslintrc.js`):

```javascript
module.exports = {
  plugins: ['millionjs'],
  // Other ESLint configurations...
};
```

If you're using react, make sure you add `eslint:recommended`,`plugin:react/jsx-runtime` and `plugin:react/recommended` to the `extends` section of your ESLint configuration file (e.g., `.eslintrc.js`):

```javascript
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
  ],
  plugins: ['millionjs'],

  // Other ESLint configurations...
};
```

you also need to add lint script to the `scripts` section of your `.package.json`:

```json
  "scripts": {
    "lint": "eslint src/  --ext .js,.jsx,.ts,.tsx  --report-unused-disable-directives --max-warnings 0"
  },
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

- `millionjs/check-block-declaration`: This rule enforces a specific pattern when using the block() function from the Million.js library.

- `millionjs/check-block-calling`: This rule enforces a specific pattern when calling a component that has been wrapped with the block() function from the Million.js library.

- `millionjs/avoid-array-map-in-block`: This rule aims to enforce a specific best practice when using the block() function in conjunction with array mapping inside a component which is to use the For or the map function.

- `millionjs/avoid-spread-attributes`: This rule aims to enforce a specific best practice when using spread attributes ({...props}) in JSX elements.

- `millionjs/validate-block-import`: This rule is designed to validate and enforce proper imports of the block function from the million/react module.

- `millionjs/ensure-complier-is-being-used`: This rule is designed to ensure that the block function from Million.js is used with the appropriate compiler setup. The block function requires the million compiler setup to work correctly, and using it without the proper configuration can lead to unexpected behavior and issues.

- `millionjs/avoid-non-deterministic-returns`: This rule enforces the use of deterministic return statements in components or functions wrapped with the block function in Million.js.

## Running ESLint

To run ESLint with the `eslint-plugin-millionjs` rules, you can use the following command:

```bash
npm run lint
```

Adjust the `src/` part to the directory or files you want to lint.

## Conclusion

With `eslint-plugin-millionjs`, you can ensure code consistency, maintainability, and adherence to best practices in your projects integrated with Million. The plugin's rules help catch potential issues early on and enhance the overall code quality. Feel free to explore the available rules and adjust the configuration to suit your project's specific needs.

For more information about MillionJS and its ecosystem, please refer to the official documentation: [https://million.dev/](https://million.dev/).
