import React, { useEffect, useState } from 'react';
import axios from "axios";
import SidebarPOS from '../components/SidebarPOS';
import { toast, Flip } from 'react-toastify';
import ReactDatePicker from "react-datepicker";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, TablePagination, Menu, MenuItem } from '@mui/material';
import "react-datepicker/dist/react-datepicker.css";
import '../components/transaction-style.css'; 

function TransactionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrder] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const [showAll, setShowAll] = useState(true);
  const [sortOrder, setSortOrder] = useState("Newest");
  const [anchorEl, setAnchorEl] = useState(null); 

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

      if (showAll) {
        return isMatchingSearchTerm; 
      }

      const isSameDate = selectedDate.toDateString() === orderDate.toDateString();
      return isSameDate && isMatchingSearchTerm;
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

  const handleAllButtonClick = () => {
    setShowAll(true);
    setSelectedDate(new Date());
    setSearchTerm("");
    setPage(0);
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
    setSortOrder(option); // Set the selected sort order
    setAnchorEl(null); // Close the dropdown
  };

  const handleCloseDropdown = () => {
    setAnchorEl(null); // Close the dropdown when clicking outside
  };

  return (
    <SidebarPOS>
      <div className='row' style={{ height: '97vh' }}>
        <div className="bg-light p-3 border border-gray">
          <header className="customer-page-header d-flex align-items-center">
            <div className='header-filter'>
              <input 
                type="text" 
                className="search-bar" 
                placeholder="Search Customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className='bi bi-filter-square' onClick={handleFilterClick}/>
            </div>
            <div className="date-picker-container">
              <button className='btn-all' onClick={handleAllButtonClick}>ALL</button>
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
                          <TableCell>More</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                          <TableRow key={order.order_id}>
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
                            <TableCell>...</TableCell>
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
            <MenuItem onClick={() => handleSortOptionClick("Oldest")}>Oldest</MenuItem>
            <MenuItem onClick={() => handleSortOptionClick("Newest")}>Newest</MenuItem>
          </Menu>
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
      return '#007bff';
    case 'PayMaya':
      return '#28a745';
    case 'Card':
      return '#17a2b8';
    default:
      return 'default';
  }
}

export default TransactionPage;
