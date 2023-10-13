import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  const [Password, setPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const generateError = (error) =>
    toast.error(error, {
      position: "bottom-right",
    });

  const generateSuccess = (message) =>
    toast.success(message, {
      position: "bottom-right",
    });

  const sendOtp = async (event) => {
    
    try {
      if(email === ''){
        toast.error("email is required",{
          position : "bottom-right"
        })
      } else {
        const  response  = await axios.post(
          "http://localhost:5000/api/auth/sendemail",
          {
            email,
          }
        )
        console.log(response);
        const data1 = response;
        const data = response.data.data;
        if (data1) {
          generateSuccess("OTP sent successfully!");
          setOtpSent(true);
          setEmail('');
        } 
        
        else {
          generateError("Failed to send OTP.");
        }
      }
      
    } catch (ex) {
      console.log(ex);
    }
  };

  const resetPassword = async (e) => {
    // e.preventDefault();
    try {
      console.log("OK")
      const response = await axios.post(
        "http://localhost:5000/api/auth/changepassword",
        {
          email,
          code,
          Password,
        }
      );
      console.log("Fine")
      console.log(response);
      const data1 = response;
      const data = response.data.data;
      if (data1) {
        generateSuccess("Password reset successfully!");
        setResetSuccess(true);
      } else {
        generateError("Failed to reset password. Please check your OTP.");
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
            <h2 className="text-center">Forgot Password</h2>
          </div>
          <div className="card-body">
            {!otpSent && !resetSuccess && (
              <div>
                <p>
                  Enter your email to receive (OTP) for
                  password reset.
                </p>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => sendOtp()}
                >
                  Send OTP
                </button>
              </div>
            )}

            {otpSent && !resetSuccess && (
              <div>
                <p>
                  An OTP has been sent to your email. Enter the OTP and your
                  new password below.
                </p>
                <div className="mb-3">
                  <label htmlFor="otp" className="form-label">
                    OTP
                  </label>
                  <input
                    type="text"
                    name="otp"
                    className="form-control"
                    placeholder="Enter OTP"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    className="form-control"
                    placeholder="New Password"
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={resetPassword}
                >
                  Reset Password
                </button>
              </div>
            )}

            {resetSuccess && (
              <div>
                <p>Your password has been successfully reset.</p>
                <Link to="/login" className="btn btn-success">
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default ForgotPassword;
