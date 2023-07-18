# eslint-plugin-million

Official ESLint plugin for millionjs

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-million`:

```sh
npm install eslint-plugin-million --save-dev
```

## Usage

Add `million` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "million"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "million/warn-block-import": "error",
        "million/warn-block-declaration": "error",
        "million/warn-block-call": "error",
        "million/warn-array-map": "error",
        "million/warn-conditional-expression": "error",
        "million/warn-ui-components": "error",
    }
}
```

## Rules

<!-- begin auto-generated rules list -->
TODO: Run eslint-doc-generator to generate the rules list.
<!-- end auto-generated rules list -->


