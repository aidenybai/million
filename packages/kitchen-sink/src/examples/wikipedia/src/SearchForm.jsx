// SearchForm.js
import React, { useState } from 'react';

const SearchForm = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchValue) {
      // Handle validation
      return;
    }
    onSearch(searchValue);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="form-input"
        placeholder="Enter search term"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <button type="submit" className="submit-btn">
        Search
      </button>
    </form>
  );
};

export default SearchForm;
