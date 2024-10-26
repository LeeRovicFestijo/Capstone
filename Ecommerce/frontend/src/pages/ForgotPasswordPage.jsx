import React, { useState } from 'react';
import axios from 'axios';
import "../style/login-signup-style.css";

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (email !== '') {
      try {
        const response = await axios.post('https://ecommerceserver.sigbuilders.app/api/forgot-password-customer', { email });
        
        if (response.status === 200) {
          setSuccessMessage('Password reset email sent! Please check your inbox.');
        } else {
          setErrorMessage('Error sending password reset email.');
        }
      } catch (error) {
        setErrorMessage(error.response?.data?.message || 'Failed to send email. Please try again.');
      }
    } else {
      setErrorMessage('Please enter a valid email address.');
    }
  };

  return (
    <div className='container'>
      <div className="d-flex justify-content-center align-items-center" style={{ height: '91vh' }}>
        <div className="row w-100 mx-2">
          <div className="col-md-6 text-white d-flex justify-content-center align-items-center flex-column p-4" style={{backgroundColor: '#1B305B'}}>
            <h2 className="mb-2" style={{fontWeight: '600'}}>SIG BUILDERS</h2>
            <h2 className="mb-4" style={{fontWeight: '600', textAlign: 'center'}}>CONSTRUCTION SUPPLY</h2>
          </div>
          <div className="col-md-6 bg-light p-4 d-flex flex-column justify-content-center">
            <h1 className="mb-4">Forgot Password?</h1>
            <p className="mb-4">Enter your email address to reset your password:</p>
            <form onSubmit={handleForgotPassword}>
              <div className="form-group mb-3">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
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
                disabled={formSubmitted && !email}
              >
                Send Reset Link
              </button>
              <div className="mt-3">
                <a href="/login">Back to Login</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
