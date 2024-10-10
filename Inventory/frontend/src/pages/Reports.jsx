import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap'; 
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faChartLine, faBoxes, faUsers, faShoppingCart, faDownload } from '@fortawesome/free-solid-svg-icons';
import MainLayout from '../layout/MainLayout';
import { useInventory } from '../api/InventoryProvider';

const Reports = () => {
    const { inventoryData } = useInventory();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customerData, setCustomerData] = useState([]);
    const [orderData, setOrderData] = useState([]);
    const [orderDetails, setOrderDetails] = useState([]);
    // Dropdown states for year and month filters (default to "All Year" and "All Month")
    const [selectedYear, setSelectedYear] = useState('All Year');
    const [selectedMonth, setSelectedMonth] = useState('All Month');

    // Inventory levels table visibility state
    const [showSalesTable, setShowSalesTable] = useState(false);
    const [showInventoryTable, setShowInventoryTable] = useState(false);
    const [showCustomerTable, setShowCustomerTable] = useState(false);
    const [showOrdersTable, setShowOrdersTable] = useState(false);

    const fetchCustomers = async () => {
        try {
            const result = await axios.get('http://localhost:5001/api/customer-report');
            setCustomerData(result.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchOrders = async () => {
        try {
          const result = await axios.get('http://localhost:5001/api/transaction-report'); 
          setOrderData(result.data);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
    };

    const handleOrderDetails = async (order_id) => {
        try {
          const result = await axios.get('http://localhost:5001/api/order-details-report', {params: {order_id}}); 
          setOrderDetails(result.data);
          setIsModalOpen(true);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
    }

    useEffect(() => {
        fetchCustomers();
        fetchOrders();
    }, []);

    // Handle year and month filter changes
    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    // Toggle inventory table view
    const handleInventoryLevelsClick = () => {
        setShowInventoryTable(!showInventoryTable); 
        setShowCustomerTable(false); 
        setShowSalesTable(false);
        setShowOrdersTable(false);
    };

    const handleCustomersClick = () => {
        setShowCustomerTable(!showCustomerTable); 
        setShowInventoryTable(false); 
        setShowSalesTable(false);
        setShowOrdersTable(false);
    };

    const handleSalesClick = () => {
        setShowSalesTable(!showInventoryTable); 
        setShowCustomerTable(false);
        setShowInventoryTable(false);
        setShowOrdersTable(false);
    };

    const handleOrdersClick = () => {
        setShowOrdersTable(!showCustomerTable); 
        setShowInventoryTable(false); 
        setShowCustomerTable(false); 
        setShowSalesTable(false);
    };

    // Download CSV for inventory
    const downloadInventoryCSV = () => {
        const csvContent = `data:text/csv;charset=utf-8,Description,Unit Price,Quantity,Unit Measurement\n` + 
            inventoryData.map(item => `${item.item_description},${item.unit_price},${item.quantity_stocks},${item.unit_measurement}`).join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "inventory_levels.csv");
        document.body.appendChild(link); // Required for Firefox
        link.click();
    };

    // Download CSV for customers
    const downloadCustomersCSV = () => {
        const csvContent = `data:text/csv;charset=utf-8,Name,Address,Phone Number,Date\n` +
            customerData.map(customer => `${customer.name},${customer.address},${customer.number},${customer.date}`).join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "customers.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <MainLayout>
            <div className='row'>
                <div className="reports-table-container p-3 poppins-font">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2>Reports</h2>
                        <div className="d-flex align-items-center">

                            <div className="filter-section d-flex align-items-center">
                                <select className="form-control" value={selectedYear} onChange={handleYearChange}>
                                    <option value="All Year">All Year</option>
                                    <option value="2023">2023</option>
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
                                </select>

                                <select className="form-control ml-2" value={selectedMonth} onChange={handleMonthChange}>
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

                                <button className="btn btn-primary ml-2">Filter</button>
                            </div>
                        </div>
                    </div>
                    <hr />

                    <div className="reports-buttons mt-4">
                        <button className="btn btn-transparent text-primary mr-3" onClick={handleSalesClick}>
                            <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                            Sales
                        </button>
                        <button className="btn btn-transparent text-primary mr-3" onClick={handleInventoryLevelsClick}>
                            <FontAwesomeIcon icon={faBoxes} className="mr-2" />
                            Inventory Levels
                        </button>
                        <button className="btn btn-transparent text-primary mr-3" onClick={handleCustomersClick}>
                            <FontAwesomeIcon icon={faUsers} className="mr-2" />
                            Customers
                        </button>
                        <button className="btn btn-transparent text-primary" onClick={handleOrdersClick}>
                            <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                            Purchase Orders
                        </button>
                    </div>

                    {showSalesTable && (
                        <div className="mt-4">
                            {/* Wrap the heading and button in a flex container */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h3>Sales</h3>
                                <Button onClick={downloadInventoryCSV} variant="success" className="mt-3">
                                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                                    Download CSV
                                </Button>
                            </div>
                            <Paper>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Item ID</TableCell>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Item Description</TableCell>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Unit Price</TableCell>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Quality Stocks</TableCell>
                                        <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Unit Measurement</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {inventoryData.map((inventory) => (
                                        <TableRow 
                                            key={inventory.item_id} 
                                        >
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{inventory.item_id}</TableCell>
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

                    {/* Inventory Levels Table */}
                    {showInventoryTable && (
                        <div className="mt-4">
                            {/* Wrap the heading and button in a flex container */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h3>Inventory Levels</h3>
                                <Button onClick={downloadInventoryCSV} variant="success" className="mt-3">
                                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                                    Download CSV
                                </Button>
                            </div>
                            <Paper>
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
                                        {inventoryData.map((inventory) => (
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
                                <h3>Customer Details</h3>
                                <Button onClick={downloadCustomersCSV} variant="success" className="mt-3">
                                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                                    Download CSV
                                </Button>
                            </div>
                            <Paper>
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
                                <h3>Purchase Orders</h3>
                                <Button onClick={downloadInventoryCSV} variant="success" className="mt-3">
                                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                                    Download CSV
                                </Button>
                            </div>
                            <Paper>
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
                                        {orderData.map((order) => (
                                        <TableRow 
                                            key={order.order_id} 
                                            style={{cursor:'pointer'}}
                                            onClick={() => handleOrderDetails(order.order_id)}
                                        >
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{order.order_id}</TableCell>
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{order.customer_name}</TableCell>
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{order.order_date}</TableCell>
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{order.order_deliver}</TableCell>
                                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{order.payment_method}</TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Paper>
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
