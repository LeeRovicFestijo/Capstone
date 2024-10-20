import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap'; 
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faChartLine, faBoxes, faUsers, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import MainLayout from '../layout/MainLayout';
import { CSVLink } from 'react-csv';

const Reports = () => {
    const [inventoryReport, setInventoryReport] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customerData, setCustomerData] = useState([]);
    const [inventoryPerformance, setInventoryPerformance] = useState([]);
    const [orderData, setOrderData] = useState([]);
    const [orderDetails, setOrderDetails] = useState([]);
    const [selectedYear, setSelectedYear] = useState('All Year');
    const [selectedMonth, setSelectedMonth] = useState('All Month');
    const [showPerformanceTable, setShowPerformanceTable] = useState(true);
    const [showInventoryTable, setShowInventoryTable] = useState(false);
    const [showCustomerTable, setShowCustomerTable] = useState(false);
    const [showOrdersTable, setShowOrdersTable] = useState(false);
    const [rowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchInventoryReport = async () => {
        try {
            const result = await axios.get('http://localhost:5001/api/inventory');
            setInventoryReport(result.data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const result = await axios.get('http://localhost:5001/api/customer-report', {
                params: {
                    year: selectedYear === 'All Year' ? null : selectedYear,
                    month: selectedMonth === 'All Month' ? null : selectedMonth,
                },
            });
            setCustomerData(result.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };
    
    const fetchOrders = async () => {
        try {
            const result = await axios.get('http://localhost:5001/api/transaction-report', {
                params: {
                    year: selectedYear === 'All Year' ? null : selectedYear,
                    month: selectedMonth === 'All Month' ? null : selectedMonth,
                },
            });
            setOrderData(result.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const fetchPerformanceData = async () => {
        try {
          const response = await axios.get('http://localhost:5001/api/inventory-performance', {
            params: {
              year: selectedYear === 'All Year' ? null : selectedYear,
              month: selectedMonth === 'All Month' ? null : selectedMonth,
            },
          });
          if (response.status === 200) {
            setInventoryPerformance(response.data); 
          }
        } catch (error) {
          console.error('Error fetching inventory performance:', error);
        }
    };

    useEffect(() => {
        fetchPerformanceData();
        fetchCustomers();
        fetchOrders();
        fetchInventoryReport();
    }, []);

    const handleFilterClick = () => {
        fetchCustomers();
        fetchOrders();
        fetchPerformanceData();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Handle year and month filter changes
    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    // Toggle inventory table view
    const handleInventoryLevelsClick = () => {
        setShowInventoryTable(true); 
        setShowCustomerTable(false); 
        setShowPerformanceTable(false);
        setShowOrdersTable(false);
    };

    const handleCustomersClick = () => {
        setShowCustomerTable(true); 
        setShowInventoryTable(false); 
        setShowPerformanceTable(false);
        setShowOrdersTable(false);
    };

    const handlePerformanceClick = () => {
        setShowPerformanceTable(true); 
        setShowCustomerTable(false);
        setShowInventoryTable(false);
        setShowOrdersTable(false);
    };

    const handleOrdersClick = () => {
        setShowOrdersTable(true); 
        setShowInventoryTable(false); 
        setShowCustomerTable(false); 
        setShowPerformanceTable(false);
    };

    const handleOrderDetails = async (order_id) => {
        try {
          const result = await axios.get('http://localhost:5001/api/order-details-report', {params: {order_id}}); 
          setOrderDetails(result.data);
          setIsModalOpen(true);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
    };

    const performanceHeaders = [
        { label: "Item Description", key: "item_description" },
        { label: "Total Sales", key: "total_sales" },
        { label: "Total Items Sold", key: "total_items_sold" },
    ];

    const csvDataPerformance = inventoryPerformance.map(item => ({
        item_description: item.item_description,
        total_sales: item.total_sales,
        total_items_sold: item.total_items_sold,
    }));

    const inventoryHeaders = [
        { label: "Item Description", key: "item_description" },
        { label: "Unit Price", key: "unit_price" },
        { label: "Quality Stocks", key: "quality_stocks" },
        { label: "Unit Measurement", key: "unit_measurement" },
    ];

    const csvDataInventory = inventoryReport.map(item => ({
        item_description: item.item_description,
        unit_price: item.unit_price,
        quality_stocks: item.quality_stocks,
        unit_measurement: item.unit_measurement,
    }));

    const customerHeaders = [
        { label: "Customer Name", key: "customer_name" },
        { label: "Address", key: "customer_address" },
        { label: "Number", key: "customer_number" },
        { label: "Email", key: "customer_email" },
    ];

    const csvDataCustomer = customerData.map(customer => ({
        customer_name: customer.customer_name,
        customer_address: customer.customer_address,
        customer_number: customer.customer_number,
        customer_email: customer.customer_email,
    }));

    const orderHeaders = [
        { label: "Order ID", key: "order_id" },
        { label: "Customer Name", key: "customer_name" },
        { label: "Order Date", key: "order_date" },
        { label: "Order Deliver", key: "order_deliver" },
        { label: "Payment Method", key: "payment_mode" },
    ];

    const csvDataOrders = orderData.map(orders => ({
        order_id: orders.order_id,
        customer_name: orders.customer_name,
        order_date: orders.order_date,
        order_deliver: orders.order_deliver,
        payment_mode: orders.payment_mode,
    }));

    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage; 
    const currentItems = orderData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(orderData.length / rowsPerPage);
  
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
  
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <MainLayout>
            <div className='row'>
                <div className="reports-table-container p-3 poppins-font">
                    <div className="row">
                        <div className="col-12 col-md-6">
                            <h2 style={{ fontWeight: '600' }}>Reports</h2>
                        </div>
                        <div className="col-12 col-md-6">
                            <div className="d-flex flex-column flex-md-row align-items-center justify-content-md-end mt-3 mt-md-0">
                            <div className="filter-section d-flex flex-column flex-md-row align-items-center w-100 w-md-auto">
                                
                                <select className="form-control mb-2 mb-md-0 mr-md-2 w-100 w-md-auto" value={selectedYear} onChange={handleYearChange}>
                                <option value="All Year">All Year</option>
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                </select>

                                <select className="form-control mb-2 mb-md-0 mr-md-2 w-100 w-md-auto" value={selectedMonth} onChange={handleMonthChange}>
                                <option value="All Month">All Month</option>
                                <option value="January">January</option>
                                <option value="February">February</option>
                                <option value="March">March</option>
                                <option value="April">April</option>
                                <option value="May">May</option>
                                <option value="June">June</option>
                                <option value="July">July</option>
                                <option value="August">August</option>
                                <option value="September">September</option>
                                <option value="October">October</option>
                                <option value="November">November</option>
                                <option value="December">December</option>
                                </select>

                                <button className="btn btn-success w-100 w-md-auto" onClick={handleFilterClick}>Filter</button>
                            </div>
                            </div>
                        </div>
                        </div>
                    <hr />

                    <div className="reports-buttons mt-4">
                        <button className="btn btn-transparent text-success mr-3" onClick={handlePerformanceClick}>
                            <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                            Inventory Performance
                        </button>
                        <button className="btn btn-transparent text-success mr-3" onClick={handleInventoryLevelsClick}>
                            <FontAwesomeIcon icon={faBoxes} className="mr-2" />
                            Inventory Levels
                        </button>
                        <button className="btn btn-transparent text-success mr-3" onClick={handleCustomersClick}>
                            <FontAwesomeIcon icon={faUsers} className="mr-2" />
                            Customers
                        </button>
                        <button className="btn btn-transparent text-success" onClick={handleOrdersClick}>
                            <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                            Purchase Orders
                        </button>
                    </div>

                    {showPerformanceTable && (
                        <div className="mt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h3 style={{ fontWeight: '600' }}>Inventory Performance</h3>
                                <CSVLink
                                    data={csvDataPerformance}
                                    headers={performanceHeaders}
                                    filename="inventory_levels.csv"
                                    target="_blank" 
                                    className="btn btn-success mt-3"
                                >
                                    Download CSV
                                </CSVLink>
                            </div>
                            <Paper className="table-responsive">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Item Description</TableCell>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Total Sales</TableCell>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Total Items Sold</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {inventoryPerformance.map((inventory) => (
                                        <TableRow 
                                            key={inventory.item_id} 
                                        >
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{inventory.item_description}</TableCell>
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{inventory.total_sales}</TableCell>
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{inventory.total_items_sold}</TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </div>
                    )}

                    {/* Inventory Levels Table */}
                    {showInventoryTable && (
                        <div className="mt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h3 style={{ fontWeight: '600' }}>Inventory Levels</h3>
                                <CSVLink
                                    data={csvDataInventory}
                                    headers={inventoryHeaders}
                                    filename="inventory_levels.csv"
                                    target="_blank" 
                                    className="btn btn-success mt-3"
                                >
                                    Download CSV
                                </CSVLink>
                            </div>
                            <Paper className="table-responsive">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Item Description</TableCell>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Unit Price</TableCell>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Quality Stocks</TableCell>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Unit Measurement</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {inventoryReport.map((inventory) => (
                                        <TableRow 
                                            key={inventory.item_id} 
                                        >
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{inventory.item_description}</TableCell>
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{inventory.unit_price}</TableCell>
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{inventory.quality_stocks}</TableCell>
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{inventory.unit_measurement}</TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </div>
                    )}

                    {showCustomerTable && (
                        <div className="mt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h3 style={{ fontWeight: '600' }}>Customer Details</h3>
                                <CSVLink
                                    data={csvDataCustomer}
                                    headers={customerHeaders}
                                    filename="customers.csv"
                                    target="_blank" 
                                    className="btn btn-success"
                                >
                                    Download CSV
                                </CSVLink>
                            </div>
                            <Paper className="table-responsive">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Customer Name</TableCell>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Address</TableCell>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Number</TableCell>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Email</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {customerData.map((customer) => (
                                        <TableRow 
                                            key={customer.customer_id} 
                                        >
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{customer.customer_name}</TableCell>
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{customer.customer_address}</TableCell>
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{customer.customer_number}</TableCell>
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{customer.customer_email}</TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </div>
                    )}

                    {showOrdersTable && (
                        <div className="mt-4">
                            {/* Wrap the heading and button in a flex container */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h3 style={{ fontWeight: '600' }}>Purchase Orders</h3>
                                <CSVLink
                                    data={csvDataOrders}
                                    headers={orderHeaders}
                                    filename="purchase_orders.csv"
                                    target="_blank" 
                                    className="btn btn-success mt-3"
                                >
                                    Download CSV
                                </CSVLink>
                            </div>
                            <Paper className="table-responsive">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Order ID</TableCell>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Customer Name</TableCell>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Order Date</TableCell>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Order Deliver</TableCell>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Payment Method</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {currentItems.map((order) => (
                                        <TableRow 
                                            key={order.order_id} 
                                            style={{cursor:'pointer'}}
                                            onClick={() => handleOrderDetails(order.order_id)}
                                        >
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{order.order_id}</TableCell>
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{order.customer_name}</TableCell>
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{formatDate(order.order_date)}</TableCell>
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{order.order_deliver}</TableCell>
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{order.payment_mode}</TableCell>
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
                    )}

                    <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogContent>
                        {orderDetails && orderDetails.length > 0 ? (
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
                                {orderDetails.map((product, index) => (
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
                            <p>No order details available.</p> 
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

export default Reports;
