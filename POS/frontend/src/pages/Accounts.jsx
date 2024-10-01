import React, { useEffect, useState } from 'react'
import SidebarPOS from '../components/SidebarPOS'
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, TablePagination, Menu, MenuItem, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Select, FormControl, InputLabel, } from '@mui/material';
import '../components/account-style.css'; 

function Accounts() {
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9); 
  const [anchorEl, setAnchorEl] = useState(null); 
  const [anchorElFilter, setanchorElFilter] = useState(null); 
  const [currentView, setCurrentView] = useState("Accounts");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortStatus, setSortStatus] = useState("Oldest");
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [formData, setFormData] = useState("");

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const result = await axios.get('http://localhost:5001/api/accounts'); 
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
      const result = await axios.get('http://localhost:5001/api/employees'); 
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
  
      return isMatchingSearchTerm && isMatchingStatus;
    });

    if (currentView === "Employee") {
      if (sortStatus === "Oldest") {
        const sortedData = filteredData.sort((a, b) => a.employee_id - b.employee_id);
        console.log("Sorted Oldest:", sortedData);
        return sortedData;
      } else if (sortStatus === "Newest") {
        const sortedData = filteredData.sort((a, b) => b.employee_id - a.employee_id);
        return sortedData;
      }
    }

    return filteredData;
  };

  const filteredData = getFilteredData();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 9));
    setPage(0);
  };

  const handleAccountClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSortOptionClick = (option) => {
    setCurrentView(option);
    setFilterStatus("All")
    setSortStatus("Oldest")
    setAnchorEl(null); // Close the dropdown
  };

  const handleCloseDropdown = () => {
    setAnchorEl(null); // Close the dropdown when clicking outside
  };

  const handleFilterClick = (event) => {
    setanchorElFilter(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setanchorElFilter(null); // Close the dropdown when clicking outside
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status); // Set filter status (Active, Inactive, All)
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
      const { account_username, account_email, account_password, account_confirmPassword, account_role, account_status } = formData;

      if (isEditing) {
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

        // Update existing account
        try {
          const response = await axios.put(`http://localhost:5001/api/accounts/${editItemId}`, formData);
          if (response.status === 200) {
            fetchAccounts();
            fetchEmployees();
            handleCloseModal();
          }
        } catch (error) {
          console.error('Error updating account:', error);
        }
      } else {
        // Add new account
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
          const response = await axios.post('http://localhost:5001/api/add_account', {
            account_username, account_email, account_password, account_confirmPassword, account_role, account_status
          });
          if (response.status === 201) {
            fetchAccounts();
            handleCloseModal();
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
          const response = await axios.put(`http://localhost:5001/api/employees/${editItemId}`, formData);
          if (response.status === 200) {
            fetchEmployees();
            fetchAccounts();
            handleCloseModal();
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

        // Add new employee
        try {
          const response = await axios.post('http://localhost:5001/api/add_employee', formData);
          if (response.status === 201) {
            fetchEmployees();
            handleCloseModal();
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

  return (
    <SidebarPOS>
      <div className='row' style={{ height: '97vh' }}>
        <div className="bg-light p-3 border border-gray rounded-right">
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
              <button className='btn-primary' onClick={() => handleOpenModal(currentView === "Accounts" ? "Account" : "Employee")}>+ Add {currentView}</button>
            </div>
          </header>
          <hr />

          <div className='account-list'>
            <div className='header-account mb-2 d-flex justify-content-between'>
              <button className='btn-primary' onClick={handleAccountClick}>{currentView} <i className='bi bi-chevron-compact-down'></i></button>
              <button className='btn-primary' onClick={handleFilterClick}>
                <i className='bi bi-funnel'/> Filter
              </button>
            </div>
            {isLoading ? (
              'Loading'
            ) : (
              <div className='row'>
                <div className="account-history">
                  <Paper>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {currentView === "Accounts" ? (
                            <>
                              <TableCell>Name</TableCell>
                              <TableCell>Role</TableCell>
                              <TableCell>Email Address</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Action</TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>Name</TableCell>
                              <TableCell>Age</TableCell>
                              <TableCell>Address</TableCell>
                              <TableCell>Phone Number</TableCell>
                              <TableCell>Email Address</TableCell>
                              <TableCell>Action</TableCell>
                            </>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                          <TableRow key={item.account_id || item.employee_id}>
                            <TableCell>{item.account_username || item.employee_name}</TableCell>
                            {currentView === "Accounts" ? (
                              <>
                                <TableCell>{item.account_role}</TableCell>
                                <TableCell>{item.account_email}</TableCell>
                                <TableCell>
                                  <Button variant="outlined" color={getButtonColor(item.account_status)}>
                                    {item.account_status}
                                  </Button>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell>{item.employee_age}</TableCell>
                                <TableCell>{item.employee_address}</TableCell>
                                <TableCell>{item.employee_number}</TableCell>
                                <TableCell>{item.employee_email}</TableCell>
                              </>
                            )}
                            <TableCell><button className='btn-primary' onClick={() => handleOpenModal(currentView === "Accounts" ? "Account" : "Employee", item)}>Edit</button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                  <TablePagination
                    rowsPerPageOptions={[5, 9]}
                    component="div"
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
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
                <MenuItem onClick={() => handleFilterChange("Inactive")}>Inactive</MenuItem>
              ]
            ) : (
              [
                <MenuItem onClick={() => handleSortChange("Oldest")}>Oldest</MenuItem>,
                <MenuItem onClick={() => handleSortChange("Newest")}>Newest</MenuItem>
              ]
            )}
          </Menu>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseDropdown}
          >
            <MenuItem onClick={() => handleSortOptionClick("Accounts")}>Accounts</MenuItem>
            <MenuItem onClick={() => handleSortOptionClick("Employee")}>Employee</MenuItem>
          </Menu>
        </div>
      </div>
    </SidebarPOS>
  )
}

export default Accounts