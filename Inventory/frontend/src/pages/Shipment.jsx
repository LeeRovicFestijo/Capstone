import React, { useEffect, useState } from 'react'
import axios from "axios";
import ReactDatePicker from "react-datepicker";
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Button, TablePagination, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import "react-datepicker/dist/react-datepicker.css";
import '../components/shipment-style.css'; 

const Shipment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [shipmentOrders, setShipmentOrder] = useState([]);
    const [shipmentDetails, setShipmentDetails] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedShipment, setSelectedShipment] = useState(null)
    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(9); 
    const [showAll, setShowAll] = useState(true);
    const [sortOrder, setSortOrder] = useState("Newest");
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

    return matchesDateAndSearchTerm && matchesPaymentMethod;
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
        return date.toLocaleDateString(); // Change to your desired format
    };

    const handleFilterClick = (event) => {
        setAnchorEl(event.currentTarget); // Anchor to the clicked element
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
        <div className='row'>
        <div className="p-1">
          <header className="order-page-header d-flex justify-content-between">
            <div className='header-filter d-flex justify-content-between'>
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
                <div className="shipment-history">
                  <Paper>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Order ID</TableCell>
                          <TableCell>Customer Name</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Total Amount</TableCell>
                          <TableCell>Shipping Address</TableCell>
                          <TableCell>Payment</TableCell>
                          <TableCell>Shipping Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentItems.map((shipment) => (
                          <TableRow key={shipment.order_id} style={{cursor:'pointer'}} onClick={() => handleShipmentOrder(shipment.order_id)}>
                            <TableCell>{shipment.order_id}</TableCell>
                            <TableCell>{shipment.customer_name}</TableCell>
                            <TableCell>{formatDate(shipment.order_date)}</TableCell>
                            <TableCell>{shipment.total_amount}</TableCell>
                            <TableCell>{shipment.shipping_address}</TableCell>
                            <TableCell>
                              <Button variant="outlined" style={{ borderColor: getButtonColorPayment(shipment.payment_mode) }}>
                                {shipment.payment_mode}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button variant="outlined" color={getButtonColorStatus(shipment.shipping_status)} onClick={(event) => handleStatusClick(event, shipment.order_id)}>
                                {shipment.shipping_status}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                  <div className="pagination">
                    <button
                        className="pagination-btn"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </span>
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
        'Pending': 'error',
        'Out For Delivery': 'warning',
        'Delivered': 'success',
    };

    return statusColors[status] || 'default';
}

export default Shipment;
