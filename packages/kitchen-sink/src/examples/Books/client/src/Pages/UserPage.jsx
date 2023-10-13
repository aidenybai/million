import React, { useState, useEffect,useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf'; 
import Navbar1 from './Navbar1';
import Footer from '../components/Footer';
import {ToastContainer,toast} from 'react-toastify'
import VanillaTilt from 'vanilla-tilt';

const UserPage = () => {
  const [books, setBooks] = useState([]);
 
  const cardRefs = useRef([]);
  
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


    cardRefs.current.forEach((card) => {
      VanillaTilt.init(card, {
        glare: true,
        reverse: true,
        'max-glare': 0.5,
      });
    });

    fetchBooks();
  }, []);
                                                      
  const generatePdf = async (book) => {
    const pdf = new jsPDF();
    pdf.setFontSize(12);
    pdf.text(`Name: ${book.name}`, 10, 10);
    pdf.text(`Author: ${book.author}`, 10, 20);
    pdf.text(`Description: ${book.description}`, 10, 30);
    pdf.text(`Price: ${book.price}`, 10, 40);
  
    try {
      const imageResponse = await axios.get(book.image, {
        responseType: 'arraybuffer',
      });
  
      const imageData = new Uint8Array(imageResponse.data);
      const imageType = book.image.substr(book.image.lastIndexOf('.') + 1);
      const imgDataUrl = `data:image/${imageType};base64,${btoa(
        new Uint8Array(imageData).reduce((data, byte) => data + String.fromCharCode(byte), '')
      )}`;
  
      pdf.addImage(imgDataUrl, 'JPEG', 10, 50, 60, 80); 
  
      pdf.save(`${book.name}.pdf`);
    } catch (error) {
      console.error(error);
      toast.error('Error generating PDF', {
        position: 'bottom-right',
      });
    }
  };
  

  return (
    <>
     <Navbar1/> 
      <div className='' style={{ minHeight: '91.5vh' , backgroundColor:'whitesmoke'}}>
        
        <div className='d-flex justify-content-center align-items-center py-3'>
        <h2 style={{ color: "black" }} className='p-2'>Books</h2>
          <h3 style={{ color: 'orange' }}>Page</h3>
        </div>
        <div className='container  mt-3'>
          <div className='row'>
            {books.map((book,index) => (
              <div key={book._id} className='col-md-4 mb-4' ref={(el) => (cardRefs.current[index] = el)}>
                <div className='card' style={{ position: 'relative' }}>
                  <img src={book.image} alt="image" className='image1' style={{ width: '100%', height: '90%', objectFit: 'cover' }} />
                  <div className='card-body' style={{ paddingLeft: '10%', paddingTop: '10px' }}>
                    <h5 className='card-title'> <span>name : </span>{book.name}</h5>
                    <p className='card-text'> <span>author : </span>{book.author}</p>
                    <p className='card-text'><span>description : </span>{book.description}</p>
                    {/* <p className='card-text'><span>Price : </span>{book.price}</p> */}
                    <button className='btn btn-success' onClick={() => generatePdf(book)}>Download</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
       <Footer/> 
    </>
  );
};

export default UserPage;
