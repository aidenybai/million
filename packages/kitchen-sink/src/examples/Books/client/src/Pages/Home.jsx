import React, { useRef } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { useAnimationFrame } from "framer-motion";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
const Home = () => {
  const img = require('../images/image2.png');
  const ref = useRef(null);

  // useAnimationFrame((time, delta) => {
  //   ref.current.style.backgroundPosition = `${time}px 50%`;
  // });

  return (
    <>
    <Navbar/>
    <div
      className="Home-Page text-black container-fluid"
      style={{
        backgroundImage: `url('https://media.giphy.com/media/xUA7b4arnbo3THfzi0/giphy.gif')`, // Replace with actual path
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <h1 style={{marginLeft : "650px", color:"red"}} > Admin Page</h1>
      <div className="row container ">
        <div
          className="col-lg-6 d-flex justify-content-center align-items-start flex-column"
          style={{ height: '91.5vh' }}
        >
          <h2 style={{ fontSize: '80px', color: 'orange', marginLeft: '120px' }}>Book store</h2>
          <h2 style={{ fontSize: '60px', color: 'white', marginLeft: '120px' }}>For You</h2>
          <Link
            to="/getall"
            style={{ marginLeft: '120px' }}
            className="btn btn-primary btn-outline my-3"
          >
            View Books
          </Link>
        </div>
        <div
          className="col-lg-6 d-flex justify-content-center align-items-center flex-column"
          style={{ height: '91.5vh' }}
        >
        
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default Home;
