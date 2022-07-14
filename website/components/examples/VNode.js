import { fromStringToVNode } from 'million/utils';
import { useEffect, useRef, useState } from 'react';
import Wrapper from './Wrapper';

export default function VNodeViz() {
  const [html, setHtml] = useState('<div>Hello World</div>');
  const [vnode, setVNode] = useState(undefined);
  const inputRef = useRef();

  useEffect(() => {
    try {
      if (html) setVNode(fromStringToVNode(html));
      else setVNode('');
    } catch (e) {}
  }, [html]);

  return (
    <Wrapper>
      <pre>
        <textarea
          ref={inputRef}
          onInput={() => {
            setHtml(inputRef.current.value);
          }}
          value={html}
          style={{ background: 'transparent', width: '100%', height: '10vh' }}
        ></textarea>
      </pre>
      <pre>
        <code
          dangerouslySetInnerHTML={{
            __html:
              vnode?.tag !== 'parsererror'
                ? JSON.stringify(vnode, null, 2) || ''
                : 'Error during parsing',
          }}
        ></code>
      </pre>
    </Wrapper>
  );
}
