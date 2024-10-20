import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
        } else if (!emailRegex.test(customer_email)) {
            valid = false;
            newErrors.customer_email = 'Please enter a valid email address';
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
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>{editMode ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
            <DialogContent>
                <div className='add-customer-form'>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Full Name"
                        name="customer_name"
                        value={customerData.customer_name}
                        onChange={handleChange}
                        error={!!errors.customer_name}
                        helperText={errors.customer_name}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Contact Number"
                        name="customer_number"
                        value={customerData.customer_number}
                        onChange={handleChange}
                        error={!!errors.customer_number}
                        helperText={errors.customer_number}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Email Address"
                        name="customer_email"
                        value={customerData.customer_email}
                        onChange={handleChange}
                        error={!!errors.customer_email}
                        helperText={errors.customer_email}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Address"
                        name="customer_address"
                        value={customerData.customer_address}
                        onChange={handleChange}
                        error={!!errors.customer_address}
                        helperText={errors.customer_address}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Date"
                        name="customer_date"
                        value={customerData.customer_date}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSave} color="success">
                    {editMode ? 'Update' : 'Done'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CustomerModal;
