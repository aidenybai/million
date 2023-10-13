import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Books.css'; 

const Books = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/books/getall');
        const data = response.data.books;
        setBooks(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchBooks();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/books/delete/${id}`);
      setBooks(books.filter(book => book._id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Navbar />
      <div className='books-container'>
        <div className='books-header'>
          <h3 style={{color:"orange"}}>Books Section</h3>
        </div>
        <div className='books-list'>
          {books.map(book => (
            <div key={book._id} className='book-card'>
              <div className='book-image'>
                <img src={book.image} alt="Book Cover" />
              </div>
              <div className='book-details'>
                <h5 className='book-title'>{book.name}</h5>
                <p className='book-author'>Author: {book.author}</p>
                <p className='book-description'>description: {book.description}</p>
                {/* <p className='book-price'>Price: ${book.price}</p> */}
                <div className='book-actions'>
                  <Link to={`/update/${book._id}`} className='btn btn-warning'>Update</Link>
                  <button className='btn btn-danger' onClick={() => handleDelete(book._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Books;
