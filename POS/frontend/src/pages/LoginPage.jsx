import React from 'react'
import MainLayout from '../layout/MainLayout'
import { Link } from 'react-router-dom'

function LoginPage() {
  return (
    <MainLayout>
        <div className="d-flex justify-content-center align-items-center" style={{height: '91vh'}}>
        <div className="row w-100 mx-2">
          <div className="col-md-6 bg-primary text-white d-flex justify-content-center align-items-center flex-column p-4">
            <h1 className="mb-4">SIG BUILDERS</h1>
            <h2 className="mb-4">CONSTRUCTION SUPPLY</h2>
            <p>&copy; All rights reserved 1976.</p>
          </div>
          <div className="col-md-6 bg-light p-4 d-flex flex-column justify-content-center">
            <h1 className="mb-4">WELCOME!</h1>
            <p className="mb-4">Enter your credentials below:</p>
            <form>
              <div className="form-group mb-3">
                <label htmlFor="id">Enter ID</label>
                <input
                  type="text"
                  className="form-control"
                  id="id"
                  placeholder="Enter ID"
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Password"
                />
              </div>
              <div className="form-group mb-3 d-flex justify-content-between">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="remember"
                  />
                  <label className="form-check-label" htmlFor="remember">
                    I'm not a robot
                  </label>
                </div>
                <a href="/forgot-password">Forgot password?</a>
              </div>
              <Link to="/pos" className="text-white text-decoration-none btn btn-primary w-100">Login</Link>
              <small className="form-text text-muted text-center mt-3">
                By continuing, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
              </small>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default LoginPage