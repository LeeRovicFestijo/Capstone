import React, { useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useEcommerce } from "../Api/EcommerceApi";
import MainLayout from '../layout/MainLayout'
import '../style/success-style.css'

function SuccessPage() {
  const { cart, setCart, persistedCustomer, checkoutDetails } = useEcommerce();
  const totalPrice = cart.reduce((price, item) => price + item.quantity * item.unit_price, 0);
  const navigate = useNavigate();
  const urlLocation = useLocation();
  const queryParams = new URLSearchParams(urlLocation.search);
  const sessionId = queryParams.get('session_id');

  const handleConfirmPayment = async () => {
    const { paymentMethod, location } = checkoutDetails;
    const finalPaymentMethod = paymentMethod === 'Cash on Delivery' ? 'Cash' : paymentMethod;

    const orderData = {
        customer_id: persistedCustomer.customer_id,
        cart: cart.map(item => ({
            item_id: item.item_id,
            item_description: item.item_description,
            order_quantity: item.quantity,
            unit_price: item.unit_price,
        })),
        total_amount: totalPrice,
        order_delivery: 'yes',
        payment_mode: finalPaymentMethod,
        account_id: 1,
        shipping_address: location
    };

    try {
        const response = await axios.post('http://localhost:5001/api/e-orders', orderData);
        if (response.status === 200) {
            setCart([]); 
        } 
    } catch (error) {
      alert('Failed to create order. Please try again.');
    }
  }; 

  useEffect(() => {
    if (sessionId) {
        handleConfirmPayment();
    }
  }, [sessionId]);

  const handleShopping = () => {
    navigate('/');
  };

  return (
    <MainLayout>
      {sessionId ? (
        <div className="success-container">
          <div className="success-message">
            <div className="success-icon">₱</div>
            <h1>Payment Successful</h1>
            <p className='payment-messsage'>Thank you for your payment!</p>
            <button className="success-button" onClick={handleShopping}>
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div>No valid session. You shouldn't be here.</div>
      )}
    </MainLayout>
  );
};

export default SuccessPage