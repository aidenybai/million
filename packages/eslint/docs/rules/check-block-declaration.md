# This ensures that the block function is used in variable declaration

Please describe the origin of the rule here.

## Rule Details

This rule aims to...

Examples of **incorrect** code for this rule:

```js
console.log(block(() => <div />)) 
export default block(() => <div />)
```

Examples of **correct** code for this rule:

```js
const Block = block(() => <div />)
```

## Further Reading

- https://million.dev/docs/rules
