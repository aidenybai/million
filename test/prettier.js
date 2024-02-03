let Block__callback$ = /*@__SKIP__*/ block(
  ({ i }) => {
    return <div>{i}</div>;
  },
  {
    shouldUpdate: (a, b) => a?.i !== b?.i,
  }
);
const callback$ = ({ i }) => {
  return <Block__callback$ i={i} />;
};
callback$._c = true;
const _temp = callback$;
