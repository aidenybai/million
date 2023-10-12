// SearchResultItem.js
import React from 'react';

const SearchResultItem = ({ result }) => {
  const { title, snippet, pageid } = result;
  const pageUrl = `http://en.wikipedia.org/?curid=${pageid}`;

  return (
    <a href={pageUrl} target="_blank" rel="noopener noreferrer">
      <h4>{title}</h4>
      <p>{snippet}</p>
    </a>
  );
};

export default SearchResultItem;
