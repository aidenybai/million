import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
const Update = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState({
    name: '',
    author: '',
    description: '',
    // price: '',
    image:' '
  });
  const [formData, setFormData] = useState({ ...initialData });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/books/getBook/${params._id}`);
        const book = response.data.book;
        setInitialData(book);
        setFormData(book);
      } catch (error) {
        console.log(error);
      }
    };

    fetchBookDetails();
  }, []);

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/books/update/${params._id}`, formData);
      setMessage(response.data.message);
      navigate('/getall');
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    setFormData((prevData) => ({
      ...prevData,
      [name]: inputValue,
    }));
  };

  const handleImageChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      image: e.target.files[0], 
    }));
  };

  return (
    <>
     <Navbar/>
    <div className="bg-dark" style={{ minHeight: '91.5vh', padding: '20px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="update-form">
              <h2 style={{color:"white"}}>Update Book</h2>
              <div className="form-group">
                <label style={{color:"orange"}}>Name:</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="form-group">
                <label style={{color:"orange"}}>Author:</label>
                <input type="text" name="author" value={formData.author} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="form-group">
                <label style={{color:"orange"}}>Description:</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-control" rows="3"></textarea>
              </div>
              {/* <div className="form-group">
                <label style={{color:"orange"}}>Price:</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="form-control" />
              </div> */}
              <div className="form-group">
             <label style={{ color: "orange" }}>Image:</label>
              <input type="url" name="image" onChange={handleInputChange} className="form-control" />
             </div>
              <div className="form-group">
                <button className="update-button btn btn-primary" onClick={handleUpdate}>Update</button>
              </div>
              <div className="message">{message}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default Update;
