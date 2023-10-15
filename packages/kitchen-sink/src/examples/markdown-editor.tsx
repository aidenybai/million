import React, { useState } from 'react';
import {marked} from 'marked';

function MarkdownEditor () {
  const [markdown, setMarkdown] = useState<string>('## Hello, Markdown!');

  function handleInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setMarkdown(event.target.value);
  }

  return (
    <div className="App">
      <div className="markdown-editor-container">
        <textarea
          className="markdown-input"
          value={markdown}
          onChange={handleInputChange}
        />
      </div>
      <div
        className="markdown-preview"
        dangerouslySetInnerHTML={{ __html: marked(markdown) }}
      />
    </div>
  );
}

export default MarkdownEditor;