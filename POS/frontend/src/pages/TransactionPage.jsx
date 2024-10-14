import React, { useEffect, useState } from 'react';
import axios from "axios";
import { toast, Flip } from 'react-toastify';
import ReactDatePicker from "react-datepicker";
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Button, TablePagination, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import "react-datepicker/dist/react-datepicker.css";
import '../components/transaction-style.css'; 
import MainLayout from '../layout/MainLayout';

function TransactionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orders, setOrder] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const [showAll, setShowAll] = useState(true);
  const [sortOrder, setSortOrder] = useState("Newest");
  const [anchorEl, setAnchorEl] = useState(null); 
  const [selectedPayment, setSelectedPayment] = useState("");

  const toastOptions = {
    position: "top-right",
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Flip,
  }

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const result = await axios.get('http://localhost:5001/api/transaction'); 
      setOrder(result.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders', toastOptions);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders
  .filter(order => {
    const orderDate = new Date(order.order_date);
    const isMatchingSearchTerm = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDateAndSearchTerm = showAll
      ? isMatchingSearchTerm
      : selectedDate.toDateString() === orderDate.toDateString() && isMatchingSearchTerm;

    const matchesPaymentMethod = selectedPayment ? order.payment_mode === selectedPayment : true;

    return matchesDateAndSearchTerm && matchesPaymentMethod;
  })
  .sort((a, b) => {
    return sortOrder === "Newest"
      ? new Date(b.order_date) - new Date(a.order_date)
      : new Date(a.order_date) - new Date(b.order_date);
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOrderDetails = async (order_id) => {
    setIsLoading(true);
    try {
      const result = await axios.get('http://localhost:5001/api/order-details', {params: {order_id}}); 
      setOrderDetails(result.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAllButtonClick = () => {
    setShowAll(true);
    setSelectedDate(new Date());
    setSearchTerm("");
    setSelectedPayment("")
    setPage(0);
    setAnchorEl(null);
  };

  const handleDateChange = (date) => {
    setShowAll(false); // Reset to show specific date transactions
    setSelectedDate(date);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Change to your desired format
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget); // Anchor to the clicked element
  };

  // Handle sort option click
  const handleSortOptionClick = (option) => {
    if (["Cash", "GCash", "PayMaya", "Card"].includes(option)) {
      setSelectedPayment(option); 
    } else {
      setSortOrder(option);
    }
    setAnchorEl(null); 
  };

  const handleCloseDropdown = () => {
    setAnchorEl(null); 
  };

  return (
    <MainLayout>
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-12 p-3'>
            <div className='order-page-header d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center'>
              <div className='header-filter d-flex flex-column flex-md-row align-items-center mb-3 mb-md-0'>
                <input 
                  type="text" 
                  className="search-bar form-control me-2" 
                  placeholder="Search Customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className='filter-btn btn btn-success' onClick={handleFilterClick}>
                  <span className='bi bi-funnel'> Filter</span>
                </button>
              </div>
              <div className="date-picker-container">
                <ReactDatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="dd MMM, yyyy"
                  className='form-control'
                />
              </div>
            </div>
            <hr />

            <div className='order-list'>
              {isLoading ? (
                'Loading'
              ) : (
                <div className='row'>
                  <div className='order-history col-12'>
                    <Paper sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Order ID</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Customer Name</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Date</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Total Amount</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Ship</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Payment</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                            <TableRow key={order.order_id} style={{ cursor: 'pointer' }} onClick={() => handleOrderDetails(order.order_id)}>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{order.order_id}</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{order.customer_name}</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{formatDate(order.order_date)}</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{order.total_amount}</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{order.order_deliver}</TableCell>
                              <TableCell>
                                <Button 
                                  variant="outlined" 
                                  style={{ 
                                    borderColor: getButtonColor(order.payment_mode), 
                                    fontFamily: 'Poppins, sans-serif' 
                                  }}>
                                  {order.payment_mode}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={filteredOrders.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </div>
                </div>
              )}
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseDropdown}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <MenuItem onClick={handleAllButtonClick}>All</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("Oldest")}>Oldest</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("Newest")}>Newest</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("Cash")}>Cash</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("GCash")}>GCash</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("PayMaya")}>PayMaya</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("Card")}>Card</MenuItem>
            </Menu>
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
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{product.unit_price}</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{product.total_amount}</TableCell>
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
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function getButtonColor(status) {
  switch (status) {
    case 'Cash':
      return '#20c997';
    case 'Gcash':
      return '#2471ce';
    case 'PayMaya':
      return '#28a745';
    case 'Card':
      return '#4a44d6';
    default:
      return 'default';
  }
}

export default TransactionPage;
