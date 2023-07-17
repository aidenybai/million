# This recommends removing the block on the current component and using a <For /> component instead.

Please describe the origin of the rule here.

## Rule Details

This rule aims to...

Examples of **incorrect** code for this rule:

```js
<div>
  {items.map((item) => (
    <div key={item}>{item}</div>
  ))}
</div>
```

Examples of **correct** code for this rule:

````js
<For each={items}>
  {(item) => <div key={item}>{item}</div>}
</For>
```

## Further Reading

- https://million.dev/docs/rules
