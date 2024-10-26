import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useEcommerce } from "../Api/EcommerceApi";
import MainLayout from '../layout/MainLayout'
import '../style/success-style.css'

function SuccessPage() {
  const { cart, setCart, persistedCustomer, locationAddress, setLocationAddress, paymentMethod, setPaymentMethod } = useEcommerce();
  const totalPrice = cart.reduce((price, item) => price + item.quantity * item.unit_price, 0);
  const navigate = useNavigate();
  const urlLocation = useLocation();
  const queryParams = new URLSearchParams(urlLocation.search);
  const sessionId = queryParams.get('session_id');
  const hasCalledPayment = useRef(false);

  const handleConfirmPayment = async () => {
    if (hasCalledPayment.current) return; 
    hasCalledPayment.current = true;

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
        payment_mode: paymentMethod,
        account_id: 1,
        shipping_address: locationAddress,
    };

    try {
        const response = await axios.post('https://ecommerceserver.sigbuilders.app/api/e-orders', orderData);
        if (response.status === 200) {
            sessionStorage.setItem('paymentSuccess', 'true');
            setCart([]);
            setLocationAddress('');
            setPaymentMethod('');
        } 
    } catch (error) {
      alert('Failed to create order. Please try again.');
    }
  }; 

  useEffect(() => {
      const fetchPaymentStatus = async () => {
          const customer_id = persistedCustomer.customer_id;
          try {
              const response = await axios.get(`https://ecommerceserver.sigbuilders.app/api/check-payment-status/${customer_id}`);
              if (sessionId === response.data.session_id && response.data.payment_status === 'pending') {
                  handleConfirmPayment(); // Call to confirm payment
              } else {
                  navigate('/'); // Navigate if payment does not exist or is not pending
              }
          } catch (error) {
              console.error('Error checking payment status:', error.message);
              navigate('/'); // Navigate on error
          }
      };

      fetchPaymentStatus(); 
  }, []);

  const handleShopping = () => {
    navigate('/');
  };

  return (
    <MainLayout>
      {sessionId ? (
        <div className="success-container">
          <div className="success-message">
            <div className="success-icon">₱</div>
            <h1 className="mt-3">Payment Successful</h1>
            <p className='payment-messsage'>Thank you for your payment!</p>
            <button className="success-button" onClick={handleShopping}>
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="success-container">
          <div className="success-message">
            <div className="error-icon">X</div>
            <h1 className="mt-3">Access Denied</h1>
            <p className='payment-messsage'>You should not be here!</p>
            <button className="error-button" onClick={handleShopping}>
              Go back
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default SuccessPage