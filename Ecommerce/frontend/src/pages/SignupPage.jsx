import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../style/login-signup-style.css";

function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const isFormValid = fullName !== '' && address !== '' && number !== '' && email !== '' && password !== '';

  const handleSignup = async (e) => {
    e.preventDefault();

    if (isFormValid) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailPattern.test(email)) {
        setErrorMessage('Please provide a proper email address!');
      } else {
        try {
          const response = await axios.post('http://localhost:5001/api/signup', {
            fullName,
            address,
            number,
            email,
            password,
          });
  
          if (response.status === 201) {
            setSuccessMessage('Signup successful! Redirecting to login...');
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          } else if (response.status === 400) {
              setErrorMessage('Email already in use!');
          }
        } catch (error) {
          setErrorMessage(error.response?.data?.message || 'Signup failed. Please try again.');
        }
      }
    }
  };

  return (
    <div className='container'>
      <div className="d-flex justify-content-center align-items-center" style={{ height: '91vh' }}>
        <div className="row w-100 mx-2">
          <div className="col-md-6 text-white d-flex justify-content-center align-items-center flex-column p-4" style={{backgroundColor: '#1B305B'}}>
            <h1 className="mb-4">SIG BUILDERS</h1>
            <h2 className="mb-4">CONSTRUCTION SUPPLY</h2>
            <p>&copy; All rights reserved 2001.</p>
          </div>
          <div className="col-md-6 bg-light p-4 d-flex flex-column justify-content-center">
            <h1 className="mb-4">Sign Up</h1>
            <form onSubmit={handleSignup}>
              <div className="form-group mb-3">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Address"
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="number">Contact Number</label>
                <input
                  type="text"
                  className="form-control"
                  id="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Contact Number"
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
              </div>
              {errorMessage && (
                <small className="text-danger d-block mb-3">
                  {errorMessage}
                </small>
              )}
              {successMessage && (
                <small className="text-success d-block mb-3">
                  {successMessage}
                </small>
              )}
              <button
                type="submit"
                className="btn w-100 text-white"
                style={{backgroundColor: '#1B305B'}}
                disabled={!isFormValid}
              >
                Sign Up
              </button>
              <p>Already have an account? <span><a href="/">Login</a></span></p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
