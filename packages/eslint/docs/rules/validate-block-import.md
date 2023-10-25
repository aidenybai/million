# This ensures that the block function imported from the million/react package

Please describe the origin of the rule here.

## Rule Details

This rule aims to...

Examples of **incorrect** code for this rule:

```js
import { block } from 'million';
```

Examples of **correct** code for this rule:

```js
import { block } from 'million/react';
```

## Further Reading

- https://million.dev/docs/rules
