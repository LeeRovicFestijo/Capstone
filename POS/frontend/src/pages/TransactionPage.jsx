import React, { useEffect, useState } from 'react';
import axios from "axios";
import SidebarPOS from '../components/SidebarPOS';
import { toast, Flip } from 'react-toastify';
import ReactDatePicker from "react-datepicker";
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Button, TablePagination, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import "react-datepicker/dist/react-datepicker.css";
import '../components/transaction-style.css'; 

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
      setSelectedPayment(option); // Set selected payment filter
    } else {
      setSortOrder(option); // If it's not a payment option, handle sorting
    }
    setAnchorEl(null); // Close the dropdown
  };

  const handleCloseDropdown = () => {
    setAnchorEl(null); // Close the dropdown when clicking outside
  };

  return (
    <SidebarPOS>
      <div className='row' style={{ height: '97vh' }}>
        <div className="bg-light p-3 border border-gray rounded-right">
          <header className="order-page-header d-flex justify-content-between">
            <div className='header-filter'>
              <input 
                type="text" 
                className="search-bar" 
                placeholder="Search Customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className='filter-btn btn-primary' onClick={handleFilterClick}>
                <i className='bi bi-funnel'/> Filter
              </button>
            </div>
            <div className="date-picker-container">
              <ReactDatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd MMM, yyyy"
              />
            </div>
          </header>
          <hr />

          <div className='order-list'>
            {isLoading ? (
              'Loading'
            ) : (
              <div className='row'>
                <div className="order-history">
                  <Paper>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Order ID</TableCell>
                          <TableCell>Customer Name</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Total Amount</TableCell>
                          <TableCell>Ship</TableCell>
                          <TableCell>Payment</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                          <TableRow key={order.order_id} style={{cursor:'pointer'}} onClick={() => handleOrderDetails(order.order_id)}>
                            <TableCell>{order.order_id}</TableCell>
                            <TableCell>{order.customer_name}</TableCell>
                            <TableCell>{formatDate(order.order_date)}</TableCell>
                            <TableCell>{order.total_amount}</TableCell>
                            <TableCell>{order.order_deliver}</TableCell>
                            <TableCell>
                              <Button variant="outlined" style={{ borderColor: getButtonColor(order.payment_mode) }}>
                                {order.payment_mode}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                  <TablePagination
                    rowsPerPageOptions={[5, 10]}
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
              {orderDetails && orderDetails.length > 0 ? ( // Check if shipmentDetails is an array and has elements
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product Name</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Measurement</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Total Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderDetails.map((product, index) => ( // Loop through the array of products
                        <TableRow key={index}>
                          <TableCell>{product.item_description}</TableCell>
                          <TableCell>{product.order_quantity}</TableCell>
                          <TableCell>{product.unit_measurement}</TableCell>
                          <TableCell>{product.unit_price}</TableCell>
                          <TableCell>{product.total_amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <p>No order details available.</p> // Handle case where no data is available
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsModalOpen(false)} color="primary">Close</Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </SidebarPOS>
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
