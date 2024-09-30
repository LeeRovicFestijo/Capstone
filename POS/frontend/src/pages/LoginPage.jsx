import React, { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usePOS } from '../api/POSProvider';

function LoginPage() {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [robotChecked, setRobotChecked] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const isFormValid = email !== '' && password !== '' && robotChecked;
  const { user, setPersistedUser } = usePOS();

  const handleNavigate = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (isFormValid) {
      try {
        const response = await axios.post('http://localhost:5001/api/login', {
          email, 
          password,
        });

        // If the login is successful, navigate to /pos
        if (response.status === 200) {
          const employee = response.data.user;
          console.log(employee);
          if (employee.account_status === 'Active') {
            setPersistedUser(employee);
            navigate('/pos', { replace: true });
          } else {
            alert('Account no longer active')
          }
        }
      } catch (error) {
        // Handle login failure
        setErrorMessage(error.response?.data?.message || 'Login failed. Incorrect username or Password.');
      }
    }
  };

  // useEffect(() => {
  //   console.log(user);
  //   navigate('/pos');
  // }, [user]);

  // useEffect(() => {
  //   console.log(user);
  //   if (user && user.account_status === 'Active') {
  //     navigate('/pos', { replace: true });
  //   }
  // }, [user, navigate]);

  return (
    <MainLayout>
      <div className="d-flex justify-content-center align-items-center" style={{ height: '91vh' }}>
        <div className="row w-100 mx-2">
          <div className="col-md-6 bg-primary text-white d-flex justify-content-center align-items-center flex-column p-4">
            <h1 className="mb-4">SIG BUILDERS</h1>
            <h2 className="mb-4">CONSTRUCTION SUPPLY</h2>
            <p>&copy; All rights reserved 1976.</p>
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
                <a href="/forgot-password">Forgot password?</a>
              </div>
              {errorMessage && (
                <small className="text-danger d-block mb-3">
                  {errorMessage}
                </small>
              )}
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={!isFormValid && !formSubmitted}
              >
                Login
              </button>
              <small className="form-text text-muted text-center mt-3">
                By continuing, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
              </small>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default LoginPage;
