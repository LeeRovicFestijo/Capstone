import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import { useReactToPrint } from 'react-to-print';
import { ComponentToPrint } from '../components/ComponentToPrint';

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
        // Print receipt
        handlePrint();
        onClose();
    };

    useEffect(() => {
        if (shippingMethod === 'OnSite') {
            setShippingAddress('');
        }
    }, [shippingMethod]);

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose}>
            <h2>Proceed to Payment</h2>
            <div>
                {customer && customer.length > 0 && (
                    <div>
                        <h4>Customer Name: {customer[0].fullName}</h4>
                    </div>
                )}
                <h4>Total Amount: ₱{totalAmount.toFixed(2)}</h4>
                <div>
                    <label>Payment Method:</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                        <option value="Cash">Cash</option>
                        <option value="Gcash">Gcash</option>
                        <option value="PayMaya">PayMaya</option>
                    </select>
                </div>
                <div>
                    <label>Shipping Method:</label>
                    <select value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}>
                        <option value="OnSite">On Site</option>
                        <option value="Ship">Ship</option>
                    </select>
                </div>
                {shippingMethod === "Ship" && (
                    <div>
                        <label>Shipping Address:</label>
                        <input 
                            type="text" 
                            value={shippingAddress} 
                            onChange={(e) => setShippingAddress(e.target.value)} 
                            placeholder="Enter shipping address" 
                        />
                    </div>
                )}
                <button onClick={handlePayment}>Pay</button>
                <button onClick={onClose}>Cancel</button>
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
