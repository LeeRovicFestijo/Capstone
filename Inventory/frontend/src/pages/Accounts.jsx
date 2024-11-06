import React, { useEffect, useState } from 'react'
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, Menu, MenuItem, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Select, FormControl, InputLabel, } from '@mui/material';
  import { Dropdown } from 'react-bootstrap';
import '../components/account-style.css'; 
import { toast, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from '../layout/MainLayout';

const Accounts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage] = useState(10); 
  const [anchorElFilter, setanchorElFilter] = useState(null); 
  const [currentView, setCurrentView] = useState("Accounts");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortStatus, setSortStatus] = useState("Oldest");
  const [filterRole, setFilterRole] = useState("All");
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [formData, setFormData] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const result = await axios.get('https://adminserver.sigbuilders.app/api/accounts'); 
      setAccounts(result.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const result = await axios.get('https://adminserver.sigbuilders.app/api/employees'); 
      setEmployees(result.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchEmployees();
  }, []);

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

  const getFilteredData = () => {
    const data = currentView === "Accounts" ? accounts : employees;

    const filteredData = data.filter(item => {
      const isMatchingSearchTerm =
        item.account_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employee_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const isMatchingStatus =
        filterStatus === "All" ||
        item.account_status === filterStatus ||
        item.employee_status === filterStatus;

      const isMatchingRole =
        filterRole === "All" || 
        item.account_role === filterRole;

      return isMatchingSearchTerm && isMatchingStatus && isMatchingRole;
    });

    if (currentView === "Employee") {
      if (sortStatus === "Oldest") {
        const sortedData = filteredData.sort((a, b) => a.employee_id - b.employee_id);
        return sortedData;
      } else if (sortStatus === "Newest") {
        const sortedData = filteredData.sort((a, b) => b.employee_id - a.employee_id);
        return sortedData;
      }
    }

    return filteredData;
  };

  const filteredData = getFilteredData();

  const handleSortOptionClick = (option) => {
    setCurrentView(option);
    setFilterStatus("All")
    setSortStatus("Oldest")
  };

  const handleFilterClick = (event) => {
    setanchorElFilter(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setanchorElFilter(null); 
  };

  const handleFilterChange = (status) => {
    if (status === 'All') {
      setFilterRole('All')
    }
    setFilterStatus(status);
    setanchorElFilter(null); 
  };

  const handleFilterRole = (role) => {
    setFilterRole(role);
    setanchorElFilter(null); 
  };

  const handleSortChange = (status) => {
    setSortStatus(status);
  };

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setFormData(item);
      setIsEditing(true);
      setEditItemId(item.account_id || item.employee_id);
    } else {
      setFormData({});
      setIsEditing(false);
      setEditItemId(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async () => {
    const errors = [];

    if (modalType === "Account") {
      const { account_username, account_email, account_role, account_status } = formData;

      if (isEditing) {
        if (!account_username || !account_email || !account_role || !account_status) {
          errors.push("All fields are required.");
        }
  
        // Email format validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (account_email && !emailPattern.test(account_email)) {
          errors.push("Please enter a valid email address.");
        }
  
        // If there are errors, show them
        if (errors.length > 0) {
          alert(errors.join("\n")); // or you could use a dialog/modal for displaying errors
          return; // Prevent submission
        }

        // Update existing account
        try {
          const response = await axios.put(`https://adminserver.sigbuilders.app/api/accounts/${editItemId}`, formData);
          if (response.status === 200) {
            fetchAccounts();
            fetchEmployees();
            handleCloseModal();
            toast.success('Account updated!', toastOptions)
          }
        } catch (error) {
          console.error('Error updating account:', error);
        }
      } else {
        // Add new account
        const { account_username, account_email, account_password, account_confirmPassword, account_role, account_status } = formData;

        if (!account_username || !account_email || !account_password || !account_confirmPassword || !account_role || !account_status) {
          errors.push("All fields are required.");
        }
  
        // Email format validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (account_email && !emailPattern.test(account_email)) {
          errors.push("Please enter a valid email address.");
        }
  
        // Password confirmation validation
        if (account_password !== account_confirmPassword) {
          errors.push("Passwords do not match.");
        }
  
        // If there are errors, show them
        if (errors.length > 0) {
          alert(errors.join("\n")); // or you could use a dialog/modal for displaying errors
          return; // Prevent submission
        }

        try {
          const response = await axios.post('https://adminserver.sigbuilders.app/api/add_account', {
            account_username, account_email, account_password, account_confirmPassword, account_role, account_status
          });
          if (response.status === 201) {
            fetchAccounts();
            handleCloseModal();
            toast.success('Account added!', toastOptions)
          }

          if (response.status === 400) {
            handleCloseModal();
            toast.error('Email is already used by another account!', toastOptions);
          }

          if (response.status === 404) {
            handleCloseModal();
            toast.error('Employee not found', toastOptions);
          }
        } catch (error) {
          console.error('Error adding account:', error);
        }
      }
    } else if (modalType === "Employee") {
      const { employee_name, employee_email, employee_address, employee_age, employee_number } = formData;

      if (isEditing) {
        if (!employee_name || !employee_email || !employee_address || !employee_age || !employee_number) {
          errors.push("All fields are required.");
        }
  
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (employee_email && !emailPattern.test(employee_email)) {
          errors.push("Please enter a valid email address.");
        }
  
        if (errors.length > 0) {
          alert(errors.join("\n")); // or you could use a dialog/modal for displaying errors
          return; // Prevent submission
        }

        // Update existing employee
        try {
          const response = await axios.put(`https://adminserver.sigbuilders.app/api/employees/${editItemId}`, formData);
          if (response.status === 200) {
            fetchEmployees();
            fetchAccounts();
            handleCloseModal();
            toast.success('Employee updated!', toastOptions)
          }
        } catch (error) {
          console.error('Error updating employee:', error);
        }
      } else {
        if (!employee_name || !employee_email || !employee_address || !employee_age || !employee_number) {
          errors.push("All fields are required.");
        }
  
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (employee_email && !emailPattern.test(employee_email)) {
          errors.push("Please enter a valid email address.");
        }
  
        if (errors.length > 0) {
          alert(errors.join("\n")); // or you could use a dialog/modal for displaying errors
          return; // Prevent submission
        }

        try {
          const response = await axios.post('https://adminserver.sigbuilders.app/api/add_employee', formData);
          if (response.status === 201) {
            fetchEmployees();
            handleCloseModal();
            toast.success('Employee added!', toastOptions)
          }
        } catch (error) {
          console.error('Error adding employee:', error);
        }
      }
    }
  };

  const getButtonColor = (status) => {
    return status === "Active" ? "success" : "error";
  };

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

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
          <header className="account-page-header d-flex justify-content-between">
            <div className='header-filter'>
              <input 
                type="text" 
                className="search-bar" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="add-account-container">
              <button className='btn btn-success' onClick={() => handleOpenModal(currentView === "Accounts" ? "Account" : "Employee")}>+ Add {currentView}</button>
            </div>
          </header>
          <hr />

          <div className='account-list'>
            <div className='header-account d-flex justify-content-between'>
              <Dropdown className='custom-dropdown-account'>
                  <Dropdown.Toggle variant="light" className="profile-dropdown-account d-flex align-items-center" id="dropdown-basic">
                      <span>{currentView}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className='custom-dropdown-menu'>
                      <Dropdown.Item onClick={() => handleSortOptionClick("Accounts")}>Accounts</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleSortOptionClick("Employee")}>Employee</Dropdown.Item>
                  </Dropdown.Menu>
              </Dropdown>
              <button className='btn btn-success' onClick={handleFilterClick}>
                <i className='bi bi-funnel'/> Filter
              </button>
            </div>
            {isLoading ? (
              'Loading'
            ) : (
              <div className='row'>
                <div className="account-history">
                  <Paper className="table-responsive">
                    <Table>
                      <TableHead>
                        <TableRow>
                          {currentView === "Accounts" ? (
                            <>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Name</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Role</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Email Address</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Status</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Action</TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Name</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Age</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Address</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Phone Number</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Email Address</TableCell>
                              <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Action</TableCell>
                            </>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentItems.map((item) => (
                          <TableRow key={item.account_id || item.employee_id}>
                            <TableCell>{item.account_username || item.employee_name}</TableCell>
                            {currentView === "Accounts" ? (
                              <>
                                <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{item.account_role}</TableCell>
                                <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{item.account_email}</TableCell>
                                <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  <Button variant="outlined" color={getButtonColor(item.account_status)}>
                                    {item.account_status}
                                  </Button>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{item.employee_age}</TableCell>
                                <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{item.employee_address}</TableCell>
                                <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{item.employee_number}</TableCell>
                                <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{item.employee_email}</TableCell>
                              </>
                            )}
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}><button className='btn btn-success' onClick={() => handleOpenModal(currentView === "Accounts" ? "Account" : "Employee", item)}>Edit</button></TableCell>
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
          <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>{isEditing ? `Edit ${modalType}` : `Add ${modalType}`}</DialogTitle>
            <DialogContent>
              {modalType === "Account" ? (
                <>
                  <TextField
                    autoFocus
                    margin="dense"
                    name="account_username"
                    label="Username"
                    fullWidth
                    value={formData.account_username || ""}
                    onChange={handleInputChange}
                  />
                  <TextField
                    margin="dense"
                    name="account_email"
                    label="Email Address"
                    fullWidth
                    value={formData.account_email || ""}
                    onChange={handleInputChange}
                  />

                  {!isEditing && (
                    <>
                      <TextField
                        margin="dense"
                        name="account_password"
                        label="Password"
                        type="password"
                        fullWidth
                        value={formData.account_password || ""}
                        onChange={handleInputChange}
                      />
                      <TextField
                        margin="dense"
                        name="account_confirmPassword"
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        value={formData.account_confirmPassword || ""}
                        onChange={handleInputChange}
                      />
                    </>
                  )}

                  <TextField
                    margin="dense"
                    name="account_role"
                    label="Role"
                    fullWidth
                    value={formData.account_role || ""}
                    onChange={handleInputChange}
                  />
                  <FormControl fullWidth margin="dense">
                    <InputLabel id="status-select-label">Status</InputLabel>
                    <Select
                      labelId="status-select-label"
                      name="account_status"
                      value={formData.account_status || ""}
                      onChange={handleInputChange}
                      label="Status"
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </>
              ) : (
                <>
                  <TextField
                    autoFocus
                    margin="dense"
                    name="employee_name"
                    label="Name"
                    fullWidth
                    value={formData.employee_name || ""}
                    onChange={handleInputChange}
                  />
                  <TextField
                    margin="dense"
                    name="employee_age"
                    label="Age"
                    type="number"
                    fullWidth
                    value={formData.employee_age || ""}
                    onChange={handleInputChange}
                  />
                  <TextField
                    margin="dense"
                    name="employee_address"
                    label="Address"
                    fullWidth
                    value={formData.employee_address || ""}
                    onChange={handleInputChange}
                  />
                  <TextField
                    margin="dense"
                    name="employee_number"
                    label="Phone Number"
                    fullWidth
                    value={formData.employee_number || ""}
                    onChange={handleInputChange}
                  />
                  <TextField
                    margin="dense"
                    name="employee_email"
                    label="Email Address"
                    fullWidth
                    value={formData.employee_email || ""}
                    onChange={handleInputChange}
                  />
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button onClick={handleFormSubmit}>{isEditing ? "Update" : "Add"}</Button>
            </DialogActions>
          </Dialog>
          <Menu
            anchorEl={anchorElFilter}
            open={Boolean(anchorElFilter)}
            onClose={handleCloseFilter}
          >
            {currentView === "Accounts" ? ( // Check if in employee view
              [
                <MenuItem onClick={() => handleFilterChange("All")}>All</MenuItem>,
                <MenuItem onClick={() => handleFilterChange("Active")}>Active</MenuItem>,
                <MenuItem onClick={() => handleFilterChange("Inactive")}>Inactive</MenuItem>,
                <MenuItem onClick={() => handleFilterRole("Admin")}>Admin</MenuItem>,
                <MenuItem onClick={() => handleFilterRole("Cashier")}>Cashier</MenuItem>
              ]
            ) : (
              [
                <MenuItem onClick={() => handleSortChange("Oldest")}>Oldest</MenuItem>,
                <MenuItem onClick={() => handleSortChange("Newest")}>Newest</MenuItem>
              ]
            )}
          </Menu>
        </div>
      </div>
    </MainLayout>
  )
};

export default Accounts;