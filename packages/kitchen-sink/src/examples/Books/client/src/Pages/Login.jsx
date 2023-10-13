import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css"; 
import RequestBooks from "./RequestBooks";
function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });

  const generateError = (error) =>
    toast.error(error, {
      position: "bottom-right",
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const {email , password} =values;
      if(email === ''){
        toast.error("email is required",{
          position : "bottom-right"
        })
      }else if(password === ''){
        toast.error("password is required",{
          position : "bottom-right"
        })
      }else {

        const { data } = await axios.post(
          "http://localhost:5000/api/auth/login",
          {
            ...values,
          },
          { withCredentials: true }
        );
        if (data) {
          if (data.errors) {
            const { email, password } = data.errors;
            if (email) generateError(email);
            else if (password) generateError(password);
          } else {
            localStorage.setItem("email",values.email);
            if (data.isAdmin === "true") {
              
              navigate("/home");
            } else {
              
              navigate("/userpage");
            }
          }
        
      }
      }
        
    } catch (ex) {
      console.log(ex);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="card mt-5">
          <div className="card-header">
            <h2 className="text-center">Login</h2>
          </div>
          <div className="card-body">
            <form onSubmit={(e) => handleSubmit(e)}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Email"
                  onChange={(e) =>
                    setValues({ ...values, [e.target.name]: e.target.value })
                  }
                 
                />
            
            {/* <RequestBooks email={values.email}/>    */}
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Password"
                  onChange={(e) =>
                    setValues({ ...values, [e.target.name]: e.target.value })
                  }
                />
              </div>
              <button type="submit" className="btn btn-success" style={{marginLeft:"90px"}}>
                Login
              </button>
            </form><br></br>
            <Link to='/forgot-password' style={{color:"red", marginLeft:"70px"}}>Forgot Password?</Link>
            <div className="mt-3">
              Don't have an account? <Link to="/register" style={{color:"blue"}}>Register</Link>
            </div>
            
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
      
    </div>
  );
}

export default Login;
