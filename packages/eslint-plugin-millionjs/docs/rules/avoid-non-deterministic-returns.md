# This ensures that returns must be deterministic. There can only be one return statement at the end of the block that returns a stable tree

Please describe the origin of the rule here.

## Rule Details

This rule aims to...

Examples of **incorrect** code for this rule:

```js
function Component() {
  const [count, setCount] = useState(initial.count);
 
  if (count > 10) {
    return <div>Too many clicks!</div>; // ❌ Wrong
  }
 
  // ❌ Wrong
  return count > 5 ? (
    'Count is greater than 5'
  ) : (
    <div>Count is {count}.</div>
  );
}
 
const ComponentBlock = block(Component);
```

Examples of **correct** code for this rule:

````js
function Component() {
  const [count, setCount] = useState(initial.count);
 
 
  return count > 5 ? (
    'Count is greater than 5'
  ) 
}
 
const ComponentBlock = block(Component);
```

## Further Reading

- https://million.dev/docs/rules
