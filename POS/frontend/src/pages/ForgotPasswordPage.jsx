import React, { useState } from 'react';
import axios from 'axios';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    try {
      const response = await axios.post('http://localhost:5001/api/forgot-password', { email });
      setMessage('Please check your email for the reset link.');
    } catch (error) {
      setMessage('Error sending reset email. Please try again.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '91vh' }}>
      <div className="row w-100 mx-2">
        <div className="col-md-6 text-white d-flex justify-content-center align-items-center flex-column p-4" style={{backgroundColor: 'rgb(20, 48, 36)'}}>
          <h1 className="mb-2" style={{fontWeight: '600'}}>SIG BUILDERS</h1>
          <h2 className="mb-4" style={{color: '#ddbb68', fontWeight: '600', textAlign: 'center'}}>AND CONSTRUCTION SUPPLY INC.</h2>
        </div>
        <div className="col-md-6 bg-light p-4 d-flex flex-column justify-content-center">
          <h1 className="mb-4">Forgot Password?</h1>
          <p className="mb-4">Enter your email to reset your password:</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            {message && (
              <small className="text-info d-block mb-3">
                {message}
              </small>
            )}
            <button type="submit" className="btn btn-success w-100" disabled={!email && formSubmitted}>
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
