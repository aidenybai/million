const h = (type, props = {}, ...children) => {
  if (props === null)
    props = {};
  props.children = children;
  return {
    type,
    props
  };
};

export { h as createElement, h, h as jsx, h as jsxs };
