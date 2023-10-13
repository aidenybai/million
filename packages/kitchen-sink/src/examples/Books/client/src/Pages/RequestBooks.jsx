import React, { useState } from 'react';
import axios from 'axios'; 
import Navbar1 from './Navbar1';
import { ToastContainer , toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Login.css';
// import './RequestBook.css'
const RequestBooks = () => {
  // const { userEmail } = useAuth();
  const [name, setName] = useState('');
  const [author, setAuthor] = useState(''); 
  const [username , setUserName] = useState('');
  const [email , setEmail] = useState(localStorage.getItem("email"));
  console.log(email)
  const handleSubmit = async (e) => {
    e.preventDefault();
//  console.log("ouside try")
    try {
        if(name ===''){
          toast.error("name is required",{
            position : "bottom-right"
          })
        }else if(author === ''){
          toast.error("author is required",{
            position : "bottom-right"
          })
        }else if(username === ''){
          toast.error("username is required",{
            position : "bottom-right"
          })
        } else {
          //   console.log("entered try")
     const response = await axios.post('http://localhost:5000/api/books/requestbook', {
      email ,
      name,
      author,
      username
    });

  //   console.log("after post request")
    const data= response.data;
     console.log(response.data);

  
    // setEmail('');
    setName('');
    setAuthor('');
    setUserName('');
  //   toast.success("Book Request Successfully!"<{
  //     position : "bottom-right"
  //   })
    alert('Book request submitted successfully!');
        }
    
    } catch (error) {
      console.error('Error submitting book request:', error);
     console.log(error.response);   
      alert('Error submitting book request. Please try again.');
    }
  };

  return (
    <>
    {/* <ToastContainer/> */}
    <Navbar1 />
    <div className="login-container"> 
      <div className="login-card"> 
        <div className="card mt-5">
          <div className="card-header">
            <h2 className="text-center" style={{ color: 'orange' }}>Request a Book</h2> 
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label" style={{ color: 'blue' }}>User Name</label>
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Enter your name"
                style={{ width: '300px' }}
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label" style={{ color: 'blue' }}>Email</label> 
              <input
                type="text"
                className="form-control"
                id="username"
                
                style={{ width: '300px' }}
                value={email}
                // onChange={(e) => setUserName(e.target.value)}
                // required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="author" className="form-label" style={{ color: 'blue' }}>Author</label> 
              <input
                type="text"
                className="form-control"
                id="author"
                placeholder="Enter Author"
                style={{ width: '300px' }}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="name" className="form-label" style={{ color: 'blue' }}>Book name</label> 
              <input
                type="text"
                className="form-control"
                id="name"
                placeholder="Enter book name"
                style={{ width: '300px' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{marginLeft:"80px"}}>
              Submit Request
            </button>
          </form>
        </div>
      </div>
    </div>
    <ToastContainer position="bottom-right" />
    {/* <ToastContainer/> */}
    </>
  );
};

export default RequestBooks;
