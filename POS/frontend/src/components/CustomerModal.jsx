import React, { useState, useEffect } from 'react';
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
    const [existingCustomers, setExistingCustomers] = useState([]);

    useEffect(() => {
        // Fetch existing customers if modal is open
        if (isOpen) {
            axios.get('customer').then(response => {
                setExistingCustomers(response.data);
            });
        }
    }, [isOpen]);

    const handleChange = (e) => {
        setCustomerData({ ...customerData, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        // Filter existing customers based on search
        const query = e.target.value.toLowerCase();
        if (query) {
            setExistingCustomers(existingCustomers.filter(customer =>
                customer.fullName.toLowerCase().includes(query)
            ));
        } else {
            // Fetch all customers again if search query is empty
            axios.get('customer').then(response => {
                setExistingCustomers(response.data);
            });
        }
    };

    const handleSelectCustomer = (customer) => {
        setCustomerData(customer);
    };

    const handleSave = () => {
        // Save new or updated customer
        axios.post('customer', customerData).then(response => {
            onSave(response.data); // Pass customer data back
            onClose(); // Close modal
        });
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose}>
            <h2>Add Customer</h2>
            <input
                type="text"
                name="search"
                placeholder="Search existing customers"
                onChange={handleSearch}
            />
            <ul>
                {existingCustomers.map(customer => (
                    <li key={customer.id} onClick={() => handleSelectCustomer(customer)}>
                        {customer.fullName}
                    </li>
                ))}
            </ul>
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
