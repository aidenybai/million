import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Register.css"; 

function Register() {
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
          "http://localhost:5000/api/auth/register",
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
            navigate("/login");
          }
        }
      }
      
    } catch (ex) {
      console.log(ex);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="card mt-5">
          <div className="card-header">
            <h2 className="text-center">Register</h2>
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
              <button type="submit" className="btn btn-primary" style={{marginLeft:"70px"}}>
                Register
              </button>
            </form>
            <div className="mt-3">
             Already have an account?<Link to="/login" style={{color:"blue"}}>Login</Link>
           </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default Register;
