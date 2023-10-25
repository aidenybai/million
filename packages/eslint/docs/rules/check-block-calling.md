# This makes sure blocks consume a reference to a component function or the direct declaration.

Please describe the origin of the rule here.

## Rule Details

This rule aims to...

Examples of **incorrect** code for this rule:

```js
const BadBlock = block(<Component />);
```

Examples of **correct** code for this rule:

```js
const GoodBlock = block(App);
```

## Further Reading

- https://million.dev/docs/rules
