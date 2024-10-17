import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ResetPasswordPage() {
  const { token } = useParams(); // Token from the email link
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/reset-password', { password, token });
      setMessage('Password has been successfully reset.');
    } catch (error) {
      setMessage('Error resetting password. Please try again.');
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
          <h1 className="mb-4">Reset Your Password</h1>
          <p className="mb-4">Enter your new password below:</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            {message && (
              <small className="text-info d-block mb-3">
                {message}
              </small>
            )}
            <button type="submit" className="btn btn-success w-100" disabled={!password}>
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
