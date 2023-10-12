import React, { useState } from 'react';
import './App.css';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import wikilogo from './wiki-logo.png'; 

const App = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPages = async (searchValue) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=20&format=json&origin=*&srsearch=${searchValue}`);
      const data = await response.json();
      const results = data.query.search;

      if (results.length < 1) {
        setError('No matching results. Please try again.');
      } else {
        setSearchResults(results);
      }

      setIsLoading(false);
    } catch (error) {
      setError('There was an error...');
      setIsLoading(false);
    }
  };

  return (
    <div className="wiki">
      <div className="container">
        <img src={wikilogo} alt="logo" /> 
        <h3>Search Wikipedia</h3>
        <SearchForm onSearch={fetchPages} />
      </div>
      <div className="results">
        {isLoading ? (
          <div className="loading"></div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <SearchResults results={searchResults} />
        )}
      </div>
    </div>
  );
};

export default App;
