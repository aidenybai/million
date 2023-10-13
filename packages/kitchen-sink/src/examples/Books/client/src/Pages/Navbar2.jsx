import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar2.css'; 

const Navbar2 = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar2" style={{border : "2px 2px 2px solid orange"}}>
      <div className="container" >
        <Link className="navbar-brand" to="/">
          Books Store
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <a className="nav-link" href="#section1">
                HOME
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#section2">
                Get started
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#section3">
                About
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar2;
