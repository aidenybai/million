'use client';
import { getSandpackCssText } from '@codesandbox/sandpack-react';
import { useServerInsertedHTML } from 'next/navigation';

export const EditorCss = () => {
  useServerInsertedHTML(() => {
    return (
      <style
        dangerouslySetInnerHTML={{ __html: getSandpackCssText() }}
        id="sandpack"
      />
    );
  });
  return null;
};
