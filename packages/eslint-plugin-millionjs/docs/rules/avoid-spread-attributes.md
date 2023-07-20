# This Avoids the use of Spread attributes in a component that is wrapped with a block function, as they can introduce non-deterministic returns.

Please describe the origin of the rule here.

## Rule Details

This rule aims to...

Examples of **incorrect** code for this rule:

```js
 const Item = () => {}
const App = block((props) => {
    return (
        <>
            <Item {...props} />
        </>
    )
})

```

Examples of **correct** code for this rule:

```js
const Item = block(() => {})

const App = (props) => {
    return (
        <>
            <Item {...props} />
        </>
    )
}
```

## Further Reading

- https://million.dev/docs/rules
