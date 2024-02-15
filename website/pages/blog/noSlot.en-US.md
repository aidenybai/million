---
title: Experimental support for No <slot /> mode
date: FEB 15, 2024
description: Some progress in removing the <slot /> elements around Million.js blocks.
---

<div className="flex flex-col items-center gap-4">

# Experimental support for No `<slot />{:jsx}` mode 
  <small>[MOHAMMAD BAGHER ABIYAT](https://twitter.com/aslemammadam) FEB 15 2024</small>
</div>

---

- Why it's here
- The feature
- Limitations

If you've used Million.js for a while, you've probably noticed there are `<slot />` elements wrapping your Million.js components. The reasoning behind that was slightly mentioned in the [Behind The Block](/blog/behind-the-block) blog post but we're going to touch on that and dicuss the ways we're going to try to avoid it.

## History

The key point in Million.js is that it takes over the rendering step of a specifc component or a chunk of your React app and then handles it itself and mounts it to the DOM directly rather than letting React do anything on that end.


![React to Million mount](/react-to-million.png)

The `Loader` component here is the bridge between Million and React! Or in other words, it's the `<slot />` element. Having `<slot />` would stop us worrying about non-Million siblings or siblings that come from other blocks. In general, it makes rendering much easier for Million.  


## Issues
This approach works flawlessly, but there are few issues being reported which are completely fair. 
### Broken Styles

In the process of adding the Million compiler, people often face this issue where the styles they used to apply do not work anymore since they did not expect there are few `slot`s have been added here and there.


```jsx
function Lion() {
  return <img src="https://million.dev/lion.svg" />;
}

// before Million
<img src="https://million.dev/lion.svg" />

// after Million
<slot>
  <img src="https://million.dev/lion.svg" />
</slot>
```

### Unpredictable Structure

The users would find it hard to predict where `<slot />` elements are going to be appended, specially when they adopt the [auto](/docs/automatic) mode. 

`<slot />` are also wrapped around some of the props in auto mode because the compiler might decide that the rendering those prps might be handled better by React rather than Million. We call those "React render scope"s which are just [React portals](https://react.dev/reference/react-dom/createPortal).
 
## Solution

After 30 days of failed [trial](https://github.com/aidenybai/million/pull/858) for removing the need for `<slot />`, I found out this is not an easy thing to do. It was hard to predict React's behaviour, having siblings caused bugs, portals were not being rendered in right position and many complicated issues like that.

So the decision was to take this step by step as an experimentation and tackling each API (block, For, ...) seperately so we see how far can we go with this. 

Now million offers an experimental flag to enable the `noSlot` mode which avoids wrapping million blocks with `<slot />` elements. 

```js
import { experimental_options } from 'million/experimental';

experimental_options.noSlot = true
// now `noSlot` mode is activated across your application  
```

### `block`
For now, only blocks support this feature, `For` and React Render Scopes are yet to be supported because of the challenging behaviours faced. We'll try our best to deliver this flag for the mentioned APIs so all users would benefit from the new behaviour.

```jsx
experimental_options.noSlot = true

function Lion() {
  return <img src="https://million.dev/lion.svg" />;
}

// without experimental_options.noSlot=false
<slot>
  <img src="https://million.dev/lion.svg" />
</slot>

// with experimental_options.noSlot=true
<img src="https://million.dev/lion.svg" />
```
  
For more information around the limitations, refer to the [docs](/docs/experimental). 
