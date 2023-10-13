import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SearchBooks.css';
import { ToastContainer, toast } from 'react-toastify';
import Navbar1 from './Navbar1';

const SearchBooks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const apiKey = 'AIzaSyC4mUAsloJg93B-iy_oDiB4z15K0ABeuIg'; 
  const debounceDelay = 100; 

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, debounceDelay);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const handleSearch = async () => {
    try {
      
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&key=${apiKey}`
        );
        setSearchResults(response.data.items || []);
      }

      
    catch (error) {
      console.error('Error searching books:', error);
    }
  };

  return (
    <>
      <Navbar1 />
      <div className="container">
        <h2 style={{ color: 'orange' }}>Search Books</h2>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Enter a book title or author"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="input-group-append">
            <button className="btn btn-outline-secondary" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
        <div className="card-container">
          {searchResults.length > 0 ? (
            searchResults.map((result) => (
              <div key={result.id} className="card">
                <a href={result.volumeInfo.infoLink} target="_blank" rel="noopener noreferrer">
                  <img
                    src={
                      result.volumeInfo.imageLinks?.thumbnail || 'placeholder-image-url'
                    }
                    alt={result.volumeInfo.title}
                    className="card-img-top"
                  />
                </a>
                <div className="card-body">
                  <h5 className="card-title">{result.volumeInfo.title}</h5>
                  <p className="card-text">
                    Author: {result.volumeInfo.authors?.join(', ')}
                  </p>
                  <p className="card-text">
                    Published Date: {result.volumeInfo.publishedDate}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>No search results yet.</p>
          )}
        </div>

        <ToastContainer />
      </div>
    </>
  );
};

export default SearchBooks;
