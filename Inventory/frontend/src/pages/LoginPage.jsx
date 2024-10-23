import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useInventory } from '../api/InventoryProvider';

function LoginPage() {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [robotChecked, setRobotChecked] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const isFormValid = email !== '' && password !== '' && robotChecked;
  const { setPersistedAdmin } = useInventory();

  const handleNavigate = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (isFormValid) {
      try {
        const response = await axios.post('http://localhost:5001/api/login-admin', {
          email, 
          password,
        });

        // If the login is successful, navigate to /pos
        if (response.status === 200) {
          const admin = response.data.user;
          if (admin.account_status === 'Active' && admin.account_role === 'Admin') {
            setPersistedAdmin(admin);
            navigate('/dashboard', { replace: true });
          } else {
            alert('Account no longer active or invalid role')
          }
        }
      } catch (error) {
        // Handle login failure
        setErrorMessage(error.response?.data?.message || 'Login failed. Incorrect username or Password.');
      }
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
            <h1 className="mb-4">WELCOME!</h1>
            <p className="mb-4">Enter your credentials below:</p>
            <form onSubmit={handleNavigate}>
                <div className="form-group mb-3">
                <label htmlFor="username">Enter Email</label> 
                <input
                    type="text"
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
                <div className="form-group mb-3 d-flex justify-content-between">
                  <div className="form-check">
                      <input
                      className="form-check-input"
                      type="checkbox"
                      id="remember"
                      checked={robotChecked}
                      onChange={() => setRobotChecked(!robotChecked)}
                      />
                      <label className="form-check-label" htmlFor="remember">
                      I'm not a robot
                      </label>
                  </div>
                </div>
                {errorMessage && (
                <small className="text-danger d-block mb-3">
                    {errorMessage}
                </small>
                )}
                <button
                type="submit"
                className="btn btn-success w-100"
                disabled={!isFormValid && !formSubmitted}
                >
                Login
                </button>
            </form>
            </div>
        </div>
    </div>
  );
}

export default LoginPage;
