import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAllBooks } from '../api';

function BookList() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    async function fetchBooks() {
      const response = await axios.get("http://localhost:5000/api/books/getall")
      const data = response.data;
     console.log(data);
      setBooks(data.books);
    }
    fetchBooks();
  }, []);

  return (
    <div>
      <h2>Book List</h2>
      <ul>
        {books.map(book => (
          <li key={book._id}>{book.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default BookList;
