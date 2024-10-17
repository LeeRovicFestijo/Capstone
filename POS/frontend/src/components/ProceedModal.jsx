import React, { useState, useRef, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { ComponentToPrint } from '../components/ComponentToPrint';
import './modal-style.css';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

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
        <Modal open={isOpen} onClose={onClose}>
            <Box sx={style}>
                <h2 className="modal-title">Proceed to Payment</h2>
                {customer && customer.length > 0 && (
                    <div className="customer-info">
                        <h4>Customer Name: <span>{customer[0].customer_name}</span></h4>
                    </div>
                )}
                <h5>Total Amount: <span>₱{totalAmount.toFixed(2)}</span></h5>
                
                <div className="form-group">
                    <label>Payment Method:</label>
                    <Select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="Cash">Cash</MenuItem>
                        <MenuItem value="GCash">Gcash</MenuItem>
                        <MenuItem value="PayMaya">PayMaya</MenuItem>
                        <MenuItem value="Card">Card</MenuItem>
                        <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                    </Select>
                </div>
                
                <div className="form-group">
                    <label>To Ship:</label>
                    <Select
                        value={shippingMethod}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="OnSite">No</MenuItem>
                        <MenuItem value="Ship">Yes</MenuItem>
                    </Select>
                </div>
                
                {shippingMethod === "Ship" && (
                    <div className="form-group">
                        <label>Shipping Address:</label>
                        <TextField
                            fullWidth
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            placeholder="Enter shipping address"
                        />
                    </div>
                )}
                
                <div className="modal-buttons">
                    <Button variant="contained" color="success" onClick={handlePayment}>Pay</Button>
                    <Button variant="outlined" color="primary" onClick={onClose}>Cancel</Button>
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
            </Box>
        </Modal>
    );
};

export default ProceedModal;
