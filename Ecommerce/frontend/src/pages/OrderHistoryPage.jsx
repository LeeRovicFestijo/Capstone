import React, { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, TablePagination } from '@mui/material';
import axios from 'axios';
import { useEcommerce } from '../Api/EcommerceApi';

function OrderHistoryPage() {
  const { persistedCustomer } = useEcommerce();
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const customer_id = persistedCustomer?.customer_id;

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Number of rows to display per page

  useEffect(() => {
    // Fetch order history from the backend
    axios.get('http://localhost:5001/api/order-history-customer', { params: { customer_id } })
      .then((response) => {
        setOrderHistory(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching order history:', error);
        setLoading(false);
      });
  }, []);

  const handleOrderDetails = async (order_id) => {
    try {
      const result = await axios.get('http://localhost:5001/api/order-details-customer', { params: { order_id } });
      setOrderDetails(result.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page on rows per page change
  };

  // Calculate displayed orders based on pagination
  const displayedOrders = orderHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <MainLayout>
      <section className='mt-3 mb-3 p-3'>
        <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold' }}>
          Your Order History
        </Typography>
        <hr />
        <TableContainer component={Paper} elevation={3} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <CircularProgress />
            </div>
          ) : orderHistory.length > 0 ? (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Order ID</TableCell>
                    <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Date</TableCell>
                    <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Status</TableCell>
                    <TableCell align="right" style={{ fontFamily: 'Poppins, sans-serif' }}>Total Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedOrders.map((order) => (
                    <TableRow key={order.order_id} style={{ cursor: 'pointer' }} onClick={() => handleOrderDetails(order.order_id)}>
                      <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{order.order_id}</TableCell>
                      <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                      <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{order.shipping_status}</TableCell>
                      <TableCell align="right" style={{ fontFamily: 'Poppins, sans-serif' }}>₱{order.total_amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={orderHistory.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          ) : (
            <Typography variant="body1" align="center" style={{ padding: '20px', fontFamily: 'Poppins, sans-serif' }}>
              No orders found.
            </Typography>
          )}
        </TableContainer>
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <DialogTitle>Order Details</DialogTitle>
          <DialogContent>
            {orderDetails && orderDetails.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Product Name</TableCell>
                      <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Quantity</TableCell>
                      <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Measurement</TableCell>
                      <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Price</TableCell>
                      <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Total Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderDetails.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{product.item_description}</TableCell>
                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{product.order_quantity}</TableCell>
                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{product.unit_measurement}</TableCell>
                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>₱{product.unit_price}</TableCell>
                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>₱{product.total_amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <p>No order details available.</p>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsModalOpen(false)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>
      </section>
    </MainLayout>
  );
}

export default OrderHistoryPage;
