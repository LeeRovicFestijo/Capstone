import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

Modal.setAppElement('#root'); // Set your app root element

const CustomerModal = ({ isOpen, onClose, onSave }) => {
    const [customerData, setCustomerData] = useState({
        fullName: '',
        contactNumber: '',
        emailAddress: '',
        address: '',
    });

    const handleChange = (e) => {
        setCustomerData({ ...customerData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        // Save new or updated customer
        axios.post('customer', customerData).then(response => {
            onSave(response.data); // Pass customer data back
            onClose(); // Close modal
        });
    };

    return (
        <Modal 
        isOpen={isOpen} 
        onRequestClose={onClose}
        style={{
            content: {
                width: '50%', 
                height: '60%',  
                margin: 'auto', 
                padding: '20px', 
            },
            overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            }
        }}
        >
            <h2>Add Customer</h2>
            <input
                type="text"
                name="fullName"
                value={customerData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
            />
            <input
                type="text"
                name="phoneNumber"
                value={customerData.phoneNumber}
                onChange={handleChange}
                placeholder="Contact Number"
            />
            <input
                type="email"
                name="emailAddress"
                value={customerData.emailAddress}
                onChange={handleChange}
                placeholder="Email Address"
            />
            <input
                type="text"
                name="address"
                value={customerData.address}
                onChange={handleChange}
                placeholder="Address"
            />
            <input
                type="text"
                name="date"
                value={customerData.date}
                onChange={handleChange}
                placeholder="Date"
            />
            <button onClick={handleSave}>Done</button>
            <button onClick={onClose}>Cancel</button>
        </Modal>
    );
};

export default CustomerModal;
