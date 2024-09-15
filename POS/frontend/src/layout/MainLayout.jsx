import React from 'react'
import { Link } from 'react-router-dom'
import { ToastContainer, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MainLayout({children}) {
  return (
    <div>
        <header>
            <nav className='navbar navbar-light bg-primary'>
                <div className='container'>
                    <Link to="/" className='navbar-brand'>SIG Builder</Link>
                </div>
            </nav>
        </header>
        <main>
            <div className='container mt-3'>
                {children}
            </div>
            <ToastContainer
                position="top-right"
                autoClose={1000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Flip}
            />
        </main>
    </div>
  )
}

export default MainLayout