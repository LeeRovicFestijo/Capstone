import React from 'react'
import MainLayout from '../layout/MainLayout'
import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <MainLayout>
        <div className='bg-light p-5 mt-4 rounded-3'>
            <h1>Welcome!</h1>
            <p>This is me</p>
            <p>This is you</p>
            <p>This is we</p>
            <Link to='/pos' className='btn btn-primary'>Click me</Link>
        </div>
    </MainLayout>
  )
}

export default HomePage