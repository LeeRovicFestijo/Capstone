import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './customer-style.css';

Modal.setAppElement('#root'); 

const CustomerModal = ({ isOpen, onClose, onSave, editMode, customerToEdit }) => {
    const [customerData, setCustomerData] = useState({
        customer_id: '',
        customer_name: '',
        customer_number: '',
        customer_email: '',
        customer_address: '',
        customer_date: ''
    });

    const [errors, setErrors] = useState({
        customer_id: '',
        customer_name: '',
        customer_number: '',
        customer_email: '',
        customer_address: '',
        customer_date: ''
    });
    
    useEffect(() => {
        if (isOpen) {
            if (editMode && customerToEdit) {
                const formattedDate = new Date(customerToEdit.customer_date).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                });
                setCustomerData({
                    customer_id: customerToEdit.customer_id || '',
                    customer_name: customerToEdit.customer_name || '',
                    customer_number: customerToEdit.customer_number || '',
                    customer_email: customerToEdit.customer_email || '',
                    customer_address: customerToEdit.customer_address || '',
                    customer_date: formattedDate || ''
                });
            } else {
                const currentDate = (() => {
                    const date = new Date();
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}/${month}/${year}`;
                })();
                setCustomerData({
                    customer_name: '',
                    customer_number: '',
                    customer_email: '',
                    customer_address: '',
                    customer_date: currentDate
                });
            }
        }
    }, [isOpen, editMode, customerToEdit]);

    const handleChange = (e) => {
        setCustomerData({ ...customerData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        const { customer_name, customer_number, customer_email, customer_address, customer_date } = customerData;
        let valid = true;
        let newErrors = {};

        if (!customer_name) {
            valid = false;
            newErrors.customer_name = 'Full Name is required';
        }
        if (!customer_number) {
            valid = false;
            newErrors.customer_number = 'Contact Number is required';
        }
        if (!customer_email) {
            valid = false;
            newErrors.customer_email = 'Email Address is required';
        }
        if (!customer_address) {
            valid = false;
            newErrors.customer_address = 'Address is required';
        }

        setErrors(newErrors);
        if (!valid) return;

        onSave(customerData);
        onClose();
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onRequestClose={onClose}
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <div className='add-customer-form'>
                <h2 className='text-center mb-4'>{editMode ? 'Edit Customer' : 'Add Customer'}</h2>
                
                <div className='form-group mb-3'>
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="customer_name"
                        className="form-control"
                        value={customerData.customer_name}
                        onChange={handleChange}
                        placeholder="Enter Full Name"
                    />
                    {errors.customer_name && <div className="text-danger">{errors.customer_name}</div>}
                </div>

                <div className='form-group mb-3'>
                    <label>Contact Number</label>
                    <input
                        type="text"
                        name="customer_number"
                        className="form-control"
                        value={customerData.customer_number}
                        onChange={handleChange}
                        placeholder="Enter Contact Number"
                    />
                    {errors.customer_number && <div className="text-danger">{errors.customer_number}</div>}
                </div>

                <div className='form-group mb-3'>
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="customer_email"
                        className="form-control"
                        value={customerData.customer_email}
                        onChange={handleChange}
                        placeholder="Enter Email Address"
                    />
                    {errors.customer_email && <div className="text-danger">{errors.customer_email}</div>}
                </div>

                <div className='form-group mb-3'>
                    <label>Address</label>
                    <input
                        type="text"
                        name="customer_address"
                        className="form-control"
                        value={customerData.customer_address}
                        onChange={handleChange}
                        placeholder="Enter Address"
                    />
                    {errors.address && <div className="text-danger">{errors.address}</div>}
                </div>

                <div className='form-group mb-3'>
                    <label>Date</label>
                    <input
                        type="text"
                        name="customer_date"
                        className="form-control"
                        value={customerData.customer_date}
                        readOnly
                    />
                </div>

                <div className="d-flex justify-content-end">
                    <button className="btn btn-primary me-2" onClick={handleSave}>
                        {editMode ? 'Update' : 'Done'}
                    </button>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </Modal>
    );
};

export default CustomerModal;
