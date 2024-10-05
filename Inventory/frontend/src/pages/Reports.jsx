import React, { useState } from 'react';
import { Dropdown, Modal, Button, Table } from 'react-bootstrap'; // Import Table
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faUserCircle, faChartLine, faBoxes, faUsers, faShoppingCart, faDownload } from '@fortawesome/free-solid-svg-icons'; // Import specific icons

const Reports = () => {
    // User profile state
    const [user, setUser] = useState({
        name: 'John Doe', // Example default user name
        email: 'johndoe@example.com', // Example default email
        password: 'password123', // Example default password
        avatar: null // You can add a user avatar URL here
    });

    // Edit user state
    const [editUser, setEditUser] = useState({ ...user });

    // Modal visibility state
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Dropdown states for year and month filters (default to "All Year" and "All Month")
    const [selectedYear, setSelectedYear] = useState('All Year');
    const [selectedMonth, setSelectedMonth] = useState('All Month');

    // Inventory levels table visibility state
    const [showInventoryTable, setShowInventoryTable] = useState(false);
    const [showCustomerTable, setShowCustomerTable] = useState(false); // New state for customer table

    // Example inventory data
    const inventoryData = [
        
    ];

    // Example customer data
    const customerData = [
        
    ];

    // Handle profile dropdown click (show modal)
    const handleProfileClick = () => {
        setEditUser({ ...user }); // Reset form with current user data
        setShowProfileModal(true);
    };

    // Handle profile input change
    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setEditUser((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Handle save profile changes
    const handleProfileSave = () => {
        setUser({ ...editUser }); // Save the changes to user state
        setShowProfileModal(false); // Close the modal
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
        setShowInventoryTable(!showInventoryTable); // Toggle table visibility
        setShowCustomerTable(false); // Hide customer table when showing inventory
    };

    const handleCustomersClick = () => {
        setShowCustomerTable(!showCustomerTable); // Toggle customer table visibility
        setShowInventoryTable(false); // Hide inventory table when showing customers
    };

    // Download CSV for inventory
    const downloadCSV = () => {
        const csvContent = `data:text/csv;charset=utf-8,Description,Unit Price,Quantity,Unit Measurement\n` + 
            inventoryData.map(item => `${item.description},${item.unitPrice},${item.quantity},${item.unit}`).join('\n');
        
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
        <div className="inventory-table-container poppins-font">
            {/* Heading Section */}
            <div className="d-flex justify-content-between align-items-center mt-4">
                <h1>Reports</h1>
                <div className="d-flex align-items-center">
                    {/* User Profile */}
                    <Dropdown>
                        <Dropdown.Toggle variant="light" className="profile-dropdown d-flex align-items-center" id="dropdown-basic">
                            {/* Show user avatar or FontAwesome icon */}
                            {user.avatar ? (
                                <img src={user.avatar} alt="user avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                            ) : (
                                <FontAwesomeIcon icon={faUserCircle} style={{ fontSize: '2rem', color: '#aaa' }} />
                            )}
                            <span className="ms-2">{user.name}</span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={handleProfileClick}>Profile</Dropdown.Item>
                            <Dropdown.Item href="#/logout">Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* Profile Modal */}
                    <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>User Profile</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="form-group">
                                <label htmlFor="name">Username</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={editUser.name}
                                    onChange={handleProfileInputChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={editUser.email}
                                    onChange={handleProfileInputChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={editUser.password}
                                    onChange={handleProfileInputChange}
                                    className="form-control"
                                />
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={handleProfileSave}>
                                Save Changes
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Filter by Year and Month */}
                    <div className="filter-section d-flex align-items-center ml-3">
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

            {/* Body Section with Four Buttons */}
            <div className="reports-buttons mt-4">
                <button className="btn btn-transparent text-primary mr-3">
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
                <button className="btn btn-transparent text-primary">
                    <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                    Purchase Orders
                </button>
            </div>

            {/* Inventory Levels Table */}
            {showInventoryTable && (
                <div className="mt-4">
                    {/* Wrap the heading and button in a flex container */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3>Inventory Levels</h3>
                        <Button onClick={downloadCSV} variant="success" className="mt-3">
                            <FontAwesomeIcon icon={faDownload} className="mr-2" />
                            Download CSV
                        </Button>
                    </div>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th>Unit Price</th>
                                <th>Quantity in Stock</th>
                                <th>Unit Measurement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.description}</td>
                                    <td>{item.unitPrice}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.unit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Customer Table */}
            {showCustomerTable && (
                <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3>Customer Details</h3>
                        <Button onClick={downloadCustomersCSV} variant="success" className="mt-3">
                            <FontAwesomeIcon icon={faDownload} className="mr-2" />
                            Download CSV
                        </Button>
                    </div>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Address</th>
                                <th>Phone Number</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerData.map((customer, index) => (
                                <tr key={index}>
                                    <td>{customer.name}</td>
                                    <td>{customer.address}</td>
                                    <td>{customer.number}</td>
                                    <td>{customer.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default Reports;
