import { block } from 'million/react';

const Wrapper = block(({ children }) => {
  return <div className="wrapper">{children}</div>;
});

const MultiChildren = block(() => {
  return (
    <Wrapper>
      <div className="child">First Child</div>
      <div className="child">Second Child</div>
    </Wrapper>
  );
});

export default MultiChildren;
