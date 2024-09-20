import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import { useReactToPrint } from 'react-to-print';
import { ComponentToPrint } from '../components/ComponentToPrint';
import './modal-style.css';

Modal.setAppElement('#root');

const ProceedModal = ({ isOpen, onClose, cart, totalAmount, customerName, customer }) => {
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [shippingMethod, setShippingMethod] = useState('OnSite');
    const [shippingAddress, setShippingAddress] = useState('');
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const handlePayment = () => {
        handlePrint();
        onClose();
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
                        <h4>Customer Name: <span>{customer[0].fullName}</span></h4>
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
                        paymentMethod={paymentMethod}
                        shippingAddress={shippingAddress}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default ProceedModal;
