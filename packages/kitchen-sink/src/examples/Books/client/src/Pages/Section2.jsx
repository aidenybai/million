import React, { useEffect } from "react";
import moment from "moment";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from "react-router-dom";
import './LandingScreen.css'; 
import Navbar from "../components/Navbar";
import Navbar2 from './Navbar2';
import Section1 from "./Section1";
import Section3 from "./Section3";
AOS.init({
    duration: '1000'
});

const Section2 = () => {
    return (
        <div  className="landing-page">
      <div className="landing row justify-content-center text-center section2" id="section2"style={{ marginTop: "200px" }}>
        <div className="col-md-9 my-auto" style={{ borderRight: '8px solid white' }}>
          <h2 style={{ color: "orange", fontSize: "130px", marginTop: "50px" }} data-aos='zoom-in'>Books store</h2>
          <h1 style={{ color: "white", marginTop: "50px" }} data-aos='zoom-out'>For you</h1>
          <Link to="/register">
            <button className='btn btn-primary' style={{ marginTop: "60px" }}>Get Started</button>
          </Link>
        </div>
      </div>
      </div>
    );
  };
  
  export default Section2;