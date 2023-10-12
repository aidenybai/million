// SearchResults.js
import React from 'react';
import SearchResultItem from './SearchResultItem';

const SearchResults = ({ results }) => {
  return (
    <div className="articles">
      {results.map((item) => (
        <SearchResultItem key={item.pageid} result={item} />
      ))}
    </div>
  );
};

export default SearchResults;
