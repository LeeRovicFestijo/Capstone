import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import axios from "axios"
import { useReactToPrint } from 'react-to-print';
import { ComponentToPrint } from '../components/ComponentToPrint';
import './modal-style.css';

Modal.setAppElement('#root');

const ProceedModal = ({ isOpen, onClose, cart, fetchProducts, totalAmount, customerName, customer, account, payment }) => {
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [shippingMethod, setShippingMethod] = useState('OnSite');
    const [shippingAddress, setShippingAddress] = useState('');
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const handlePayment = async () => {
        const orderData = {
            customer_id: customer[0].customer_id,
            cart: cart.map(item => ({
                item_id: item.item_id,
                item_description: item.item_description,
                order_quantity: item.quantity,
                unit_price: item.unit_price,
            })),
            total_amount: totalAmount,
            order_delivery: shippingMethod === 'Ship' ? 'yes' : 'no',
            payment_mode: paymentMethod,
            account_id: account.account_id,
            shipping_address: shippingAddress
        };

        console.log(orderData);

        try {
            const response = await axios.post('http://localhost:5001/api/orders', orderData);
            if (response.status === 200) {
                handlePrint(); // Print the receipt after successful order creation
                payment();
                fetchProducts();
                onClose(); // Close the modal
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to create order. Please try again.');
        }
    };

    useEffect(() => {
        if (shippingMethod === 'OnSite') {
            setShippingAddress('');
        }
    }, [shippingMethod]);

    return (
        <Modal 
            isOpen={isOpen} 
            onRequestClose={onClose}
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <div className="proceed-modal-body">
                <h2 className="modal-title">Proceed to Payment</h2>
                {customer && customer.length > 0 && (
                    <div className="customer-info">
                        <h4>Customer Name: <span>{customer[0].customer_name}</span></h4>
                    </div>
                )}
                <h4>Total Amount: <span>₱{totalAmount.toFixed(2)}</span></h4>
                
                <div className="form-group">
                    <label>Payment Method:</label>
                    <div class="select-wrapper">
                        <select class="form-control" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                            <option value="Cash">Cash</option>
                            <option value="Gcash">Gcash</option>
                            <option value="PayMaya">PayMaya</option>
                            <option value="Card">Card</option>
                        </select>
                        <i className="bi bi-chevron-down"></i>
                    </div>
                </div>
                
                <div className="form-group">
                    <label>To Ship:</label>
                    <div className='select-wrapper'>
                        <select 
                            className="form-control" 
                            value={shippingMethod} 
                            onChange={(e) => setShippingMethod(e.target.value)}
                        >
                            <option value="OnSite">No</option>
                            <option value="Ship">Yes</option>
                        </select>
                        <i className="bi bi-chevron-down"></i>
                    </div>
                </div>
                
                {shippingMethod === "Ship" && (
                    <div className="form-group">
                        <label>Shipping Address:</label>
                        <input 
                            type="text" 
                            className="form-control"
                            value={shippingAddress} 
                            onChange={(e) => setShippingAddress(e.target.value)} 
                            placeholder="Enter shipping address" 
                        />
                    </div>
                )}
                
                <div className="modal-buttons">
                    <button className="btn btn-primary" onClick={handlePayment}>Pay</button>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                </div>

                <div style={{ display: 'none' }}>
                    <ComponentToPrint 
                        ref={componentRef} 
                        cart={cart} 
                        totalAmount={totalAmount} 
                        customerName={customerName}
                        customer={customer}
                        paymentMethod={paymentMethod}
                        shippingAddress={shippingAddress}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default ProceedModal;
