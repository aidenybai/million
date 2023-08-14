import { useState } from 'react';
import { block } from 'million/react';
import styled from 'styled-components';

const Button = styled.button`
  display: inline-block;
  color: #bf4f74;
  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid #bf4f74;
  border-radius: 3px;
  display: block;
`;

const Counter = block(() => {
  const [count, setCount] = useState(0);

  return <Button onClick={() => setCount(count + 1)}>{count}</Button>;
});

export default Counter;
