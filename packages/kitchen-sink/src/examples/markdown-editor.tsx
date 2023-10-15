import { useRef, useEffect } from 'react';
import { marked } from 'marked';
import { block } from 'million/react';

const MarkdownEditor = block(() => {
  const markdownRef = useRef<HTMLTextAreaElement>(null);
  const markdownPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (markdownRef.current && markdownPreviewRef.current) {
      markdownPreviewRef.current.innerHTML = marked(markdownRef.current.value);
    }
  }, []);

  const handleInputChange = () => {
    if (markdownRef.current && markdownPreviewRef.current) {
      markdownPreviewRef.current.innerHTML = marked(markdownRef.current.value);
    }
  };

  return (
    <div className="markdown-block">
      <div className="markdown-editor-container">
        <textarea
          className="markdown-input"
          ref={markdownRef}
          onInput={handleInputChange}
          defaultValue="## Hello, Markdown!"
        />
      </div>
      <div className="markdown-preview" ref={markdownPreviewRef}></div>
    </div>
  );
});

export default MarkdownEditor;
