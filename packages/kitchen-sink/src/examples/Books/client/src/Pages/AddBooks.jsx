import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const AddBooks = () => {
  const [bookName, setBookName] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  // const [price, setprice] = useState('');
  const [image , setImage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      if (bookName === '') {
        toast.error("Book Name is required", {
          position: "bottom-right"
        });
      } else if (author === '') {
        toast.error("Author is required", {
          position: "bottom-right"
        });
      } else if (description === '') {
        toast.error("Description is required", {
          position: "bottom-right"
        });
      } else {
        const response = await axios.post('http://localhost:5000/api/books/addBook', {
          name: bookName,
          author,
          description,
          // price: parseFloat(price),
          image
        });
  
        console.log('Book added successfully:', response.data.newBook);
  
        setBookName('');
        setAuthor('');
        setDescription('');
        // setprice('');
        setImage('');
      }
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };
  

  return (
<>
    <Navbar/>
    <div className="bg-dark" style={{ minHeight: '91.5vh', padding: '20px'  }}>
      <div className="container" style={{marginTop:'70px'}}>
        <div className="row justify-content-center">
          <div className="col-md-6">
          <h1 style={{color:'pink' , marginLeft:"200px"}}>Add Book</h1>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="bookName" style={{ color: 'orange' }}>Book Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="bookName"
                  placeholder="Enter book name"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="author" style={{ color: 'orange' }}>Author</label>
                <input
                  type="text"
                  className="form-control"
                  id="author"
                  placeholder="Enter author name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="description" style={{ color: 'orange' }}>Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  rows="3"
                  placeholder="Enter book description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              {/* <div className="form-group" style={{ color: 'orange' }}>
                <label htmlFor="price">price</label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  placeholder="Enter book price"
                  // value={price}
                  // onChange={(e) => setprice(e.target.value)}
                />
              </div> */}
              <div className="form-group">
                <label htmlFor="image" style={{ color: 'orange' }}>Image</label>
                <input
                  type="text"
                  className="form-control"
                  id="image"
                  placeholder="Enter Image Url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">Add Book</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <ToastContainer />
    <Footer/>
    </>
  );
}

export default AddBooks;
