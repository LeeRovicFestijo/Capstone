import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import './customer-style.css';
import { usePOS } from '../api/POSProvider';

Modal.setAppElement('#root'); 

const CustomerModal = ({ isOpen, onClose, onSave }) => {
    const [customerData, setCustomerData] = useState({
        fullName: '',
        phoneNumber: '',
        emailAddress: '',
        address: '',
        date: ''
    });

    const { setSelectedCustomerLocal } = usePOS();

    const [errors, setErrors] = useState({
        fullName: '',
        phoneNumber: '',
        emailAddress: '',
        address: '',
        date: ''
    });
    

    useEffect(() => {
        if (isOpen) {
            const currentDate = new Date().toISOString().split('T')[0];
            setCustomerData(prevData => ({ ...prevData, date: currentDate }));
        }
    }, [isOpen]);

    const handleChange = (e) => {
        setCustomerData({ ...customerData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        const { fullName, phoneNumber, emailAddress, address, date } = customerData;
        let valid = true;
        let newErrors = {
            fullName: '',
            phoneNumber: '',
            emailAddress: '',
            address: '',
            date: ''
        };
    
        if (!fullName) {
            valid = false;
            newErrors.fullName = 'Full Name is required';
        }
        if (!phoneNumber) {
            valid = false;
            newErrors.contactNumber = 'Contact Number is required';
        }
        if (!emailAddress) {
            valid = false;
            newErrors.emailAddress = 'Email Address is required';
        }
        if (!address) {
            valid = false;
            newErrors.address = 'Address is required';
        }
        if (!date) {
            valid = false;
            newErrors.date = 'Date is required';
        }
    
        if (!valid) {
            setErrors(newErrors);
            return;
        }
    
        axios.post('customer', customerData).then(response => {
            onSave(response.data);
            onClose();
        }).catch(error => {
            console.error("There was an error adding the customer!", error);
        });
    
        setSelectedCustomerLocal(customerData);
    };
    

    return (
        <Modal 
            isOpen={isOpen} 
            onRequestClose={onClose}
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <div className='add-customer-form'>
                <h2 className='text-center mb-4'>Add Customer</h2>
                <div className='form-group mb-3'>
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        className="form-control"
                        value={customerData.fullName}
                        onChange={handleChange}
                        placeholder="Enter Full Name"
                    />
                    {errors.fullName && <div className="text-danger">{errors.fullName}</div>}
                </div>

                <div className='form-group mb-3'>
                    <label>Contact Number</label>
                    <input
                        type="number"
                        name="phoneNumber"
                        className="form-control"
                        value={customerData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Enter Contact Number"
                    />
                    {errors.contactNumber && <div className="text-danger">{errors.phoneNumber}</div>}
                </div>

                <div className='form-group mb-3'>
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="emailAddress"
                        className="form-control"
                        value={customerData.emailAddress}
                        onChange={handleChange}
                        placeholder="Enter Email Address"
                    />
                    {errors.emailAddress && <div className="text-danger">{errors.emailAddress}</div>}
                </div>

                <div className='form-group mb-3'>
                    <label>Address</label>
                    <input
                        type="text"
                        name="address"
                        className="form-control"
                        value={customerData.address}
                        onChange={handleChange}
                        placeholder="Enter Address"
                    />
                    {errors.address && <div className="text-danger">{errors.address}</div>}
                </div>

                <div className='form-group mb-3'>
                    <label>Date</label>
                    <input
                        type="text"
                        name="date"
                        className="form-control"
                        value={customerData.date}
                        readOnly
                    />
                    {errors.date && <div className="text-danger">{errors.date}</div>}
                </div>

                <div className="d-flex justify-content-end">
                    <button className="btn btn-primary me-2" onClick={handleSave}>Done</button>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </Modal>
    );
};

export default CustomerModal;
