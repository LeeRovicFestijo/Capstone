import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import '../style/cancel-style.css'; 

function CancelPage() {
  const navigate = useNavigate();

  const handleShopping = () => {
    navigate('/');
  };

  return (
    <MainLayout>
      <div className="cancel-container">
        <div className="cancel-message">
          <div className="cancel-icon">X</div>
          <h1 className="cancel-header mt-3">Payment Cancelled</h1>
          <p className='cancel-messsage'>Your payment was cancelled. You can try again or continue shopping.</p>
          <button className="cancel-button" onClick={handleShopping}>
            Continue Shopping
          </button>
        </div>
      </div>
    </MainLayout>
  );
}

export default CancelPage;
