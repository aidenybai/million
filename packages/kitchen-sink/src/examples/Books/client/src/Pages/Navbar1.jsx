import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar1.css'; 

const Navbar1 = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar1">
      <div className="container">
        <Link className="navbar-brand" to="/" style={{ color: "white" }}>
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
              <Link
                className="nav-link"
                style={{ color: "white" }}
                to="/userpage"
              >
                HOME
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                style={{ color: "white" }}
                to="/searchbook"
              >
                Search Book
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                style={{ color: "white" }}
                to="/requestbook"
              >
                Request
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                style={{ color: "white" }}
                to="/"
              >
                Logout
              </Link>
            </li>
            <li className="nav-item">
              <a
                href="mailto:kalagotlabharathkumarreddy@gmail.com"
                className="nav-link"
                style={{ color: "white" }}
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar1;
