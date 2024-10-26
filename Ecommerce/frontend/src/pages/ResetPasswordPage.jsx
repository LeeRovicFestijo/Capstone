import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../style/login-signup-style.css";

function ResetPasswordPage() {
  const { token } = useParams(); // Get the token from the URL
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post('https://ecommerceserver.sigbuilders.app/api/reset-password-customer', { password, token });
      if (response.status === 200) {
        setSuccessMessage('Password reset successful! You can now log in.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000); // Redirect after 2 seconds
      } else {
        setErrorMessage('Error resetting password. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Failed to reset password. Please try again.');
    }
  };

  return (
    <div className='container'>
      <div className="d-flex justify-content-center align-items-center" style={{ height: '91vh' }}>
        <div className="row w-100 mx-2">
          <div className="col-md-6 text-white d-flex justify-content-center align-items-center flex-column p-4" style={{backgroundColor: '#1B305B'}}>
            <h2 className="mb-2">SIG BUILDERS</h2>
            <h2 className="mb-4" style={{fontWeight: '600', textAlign: 'center'}}>CONSTRUCTION SUPPLY</h2>
          </div>
          <div className="col-md-6 bg-light p-4 d-flex flex-column justify-content-center">
            <h1 className="mb-2" style={{fontWeight: '600'}}>Reset Password</h1>
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
                  placeholder="New Password"
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
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
              >
                Reset Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
