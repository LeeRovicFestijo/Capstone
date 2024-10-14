import React, { useEffect, useState } from 'react'
import axios from "axios";
import ReactDatePicker from "react-datepicker";
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import "react-datepicker/dist/react-datepicker.css";
import '../components/shipment-style.css'; 
import MainLayout from '../layout/MainLayout';

const Shipment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [shipmentOrders, setShipmentOrder] = useState([]);
    const [shipmentDetails, setShipmentDetails] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedShipment, setSelectedShipment] = useState(null)
    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage] = useState(10); 
    const [showAll, setShowAll] = useState(true);
    const [sortOrder, setSortOrder] = useState("Newest");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [anchorEl, setAnchorEl] = useState(null); 
    const [anchorElStatus, setAnchorElStatus] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const fetchShipmentOrders = async () => {
        setIsLoading(true);
        try {
            const result = await axios.get('http://localhost:5001/api/shipment-order'); 
            setShipmentOrder(result.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchShipmentOrders();
    }, []);

    const filteredOrders = shipmentOrders
    .filter(shipment => {
        const orderDate = new Date(shipment.order_date);
        const isMatchingSearchTerm = shipment.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesDateAndSearchTerm = showAll
            ? isMatchingSearchTerm
            : selectedDate.toDateString() === orderDate.toDateString() && isMatchingSearchTerm;

        const matchesPaymentMethod = selectedPayment ? shipment.payment_mode === selectedPayment : true;
        const matchesStatus = selectedStatus ? shipment.shipping_status === selectedStatus : true;

        return matchesDateAndSearchTerm && matchesPaymentMethod && matchesStatus;
    })
    .sort((a, b) => {
        return sortOrder === "Newest"
            ? new Date(b.order_date) - new Date(a.order_date)
            : new Date(a.order_date) - new Date(b.order_date);
    });

    const handleDateChange = (date) => {
        setShowAll(false); // Reset to show specific date transactions
        setSelectedDate(date);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const handleFilterClick = (event) => {
        setAnchorEl(event.currentTarget); 
    };

    const handleStatusClick = (event, shipment) => {
        event.stopPropagation();
        setAnchorElStatus(event.currentTarget);
        setSelectedShipment(shipment);
    }

    // Handle sort option click
    const handleSortOptionClick = (option) => {
      if (["Cash", "GCash", "PayMaya", "Card"].includes(option)) {
          setSelectedPayment(option); 
      } else if (["Pending", "Out For Delivery", "Delivered", "Cancelled"].includes(option)){
          setSelectedStatus(option);
      } else {
        setSortOrder(option);
      }
      setAnchorEl(null);
    };

    const handleStatusChange = (status) => {
    if (selectedShipment) { // Ensure selectedShipment is defined
        const updatedShipmentOrders = shipmentOrders.map((shipment) => {
        if (shipment.order_id === selectedShipment) {
            return { ...shipment, shipping_status: status }; // Update status
        }
        return shipment;
        });
    
        setShipmentOrder(updatedShipmentOrders); // Update state
        setAnchorElStatus(null); // Close the status menu
    
        // Make an API call to update the status in the backend
        axios.put(`http://localhost:5001/api/shipment-order/${selectedShipment}`, { shipping_status: status })
        .then(response => {
            console.log('Status updated:', response);
            fetchShipmentOrders(); 
        })
        .catch(error => {
            console.error('Error updating status:', error);
        });
    }
    };
    
    const handleCloseStatus = () => {
        setAnchorElStatus(null);
    }

    const handleCloseDropdown = () => {
        setAnchorEl(null);
    };

    const handleAllButtonClick = () => {
        setShowAll(true);
        setSelectedDate(new Date());
        setSearchTerm("");
        setSelectedPayment("")
        setSelectedStatus('');
        setCurrentPage(1);
        setAnchorEl(null);
    };

    const handleShipmentOrder = async (order_id) => {
        setIsLoading(true);
        try {
            const result = await axios.get('http://localhost:5001/api/shipment-details', {params: {order_id}}); 
            setShipmentDetails(result.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage; // Use 'rowsPerPage' here
    const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
  
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
      <MainLayout>
        <div className='row'>
          <div className="p-3 mt-1">
            <header className="order-page-header d-flex justify-content-between">
              <div className='header-filter d-flex justify-content-between'>
                <input 
                  type="text" 
                  className="search-bar" 
                  placeholder="Search Customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className='ml-1 btn btn-success' onClick={handleFilterClick}>
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
                  <div className="shipment-history">
                    <Paper className="table-responsive">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Order ID</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Customer Name</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Date</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Total Amount</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Shipping Address</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Payment</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Shipping Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {currentItems.map((shipment) => (
                            <TableRow key={shipment.order_id} style={{cursor:'pointer'}} onClick={() => handleShipmentOrder(shipment.order_id)}>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{shipment.order_id}</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{shipment.customer_name}</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{formatDate(shipment.order_date)}</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{shipment.total_amount}</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{shipment.shipping_address}</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <Button variant="outlined" style={{ borderColor: getButtonColorPayment(shipment.payment_mode) }}>
                                  {shipment.payment_mode}
                                </Button>
                              </TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <Button 
                                  variant="outlined" 
                                  color={getButtonColorStatus(shipment.shipping_status)} 
                                  onClick={(event) => handleStatusClick(event, shipment.order_id)}
                                  disabled={shipment.shipping_status === 'Delivered' || shipment.shipping_status === 'Cancelled'}
                                  sx={{
                                    '&.Mui-disabled': {
                                      color: shipment.shipping_status === 'Delivered' ? 'green' : 
                                             shipment.shipping_status === 'Cancelled' ? 'red' : 'gray', // Set color based on status
                                      borderColor: shipment.shipping_status === 'Delivered' ? 'green' : 
                                                   shipment.shipping_status === 'Cancelled' ? 'red' : 'gray', // Set border color too
                                    }
                                  }}
                                >
                                  {shipment.shipping_status}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                    <div className="pagination d-flex flex-column flex-sm-row justify-content-between align-items-center">
                        <button
                            className="pagination-btn mb-2 mb-sm-0"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <div className="pagination-info mb-2 mb-sm-0">
                            Page {currentPage} of {totalPages}
                        </div>
                        <button
                            className="pagination-btn"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
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
              <MenuItem onClick={() => handleSortOptionClick("Pending")}>Pending</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("Out For Delivery")}>Out for Delivery</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("Delivered")}>Delivered</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("Cancelled")}>Cancelled</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("Cash")}>Cash</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("GCash")}>GCash</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("PayMaya")}>PayMaya</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("Card")}>Card</MenuItem>
            </Menu>
            <Menu
              anchorEl={anchorElStatus}
              open={Boolean(anchorElStatus)}
              onClose={handleCloseStatus}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <MenuItem onClick={() => handleStatusChange("Pending")}>Pending</MenuItem>
              <MenuItem onClick={() => handleStatusChange("Out For Delivery")}>Out for Delivery</MenuItem>
              <MenuItem onClick={() => handleStatusChange("Delivered")}>Delivered</MenuItem>
              <MenuItem onClick={() => handleStatusChange("Cancelled")}>Cancelled</MenuItem>
            </Menu>
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <DialogTitle>Order Details</DialogTitle>
              <DialogContent>
                {shipmentDetails && shipmentDetails.length > 0 ? ( // Check if shipmentDetails is an array and has elements
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
                        {shipmentDetails.map((product, index) => ( // Loop through the array of products
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
      </MainLayout>
    );
};

function getButtonColorPayment(status) {
    const paymentColors = {
        'Cash': '#20c997',
        'GCash': '#2471ce',
        'PayMaya': '#28a745',
        'Card': '#4a44d6',
    };

    return paymentColors[status] || 'default';
}

function getButtonColorStatus(status) {
    const statusColors = {
        'Pending': 'warning',
        'Out For Delivery': 'info',
        'Delivered': 'success',
        'Cancelled': 'error',
    };

    return statusColors[status] || 'default';
}

export default Shipment;
