import React, { useEffect, useState } from 'react'
import SidebarPOS from '../components/SidebarPOS'
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, TablePagination, Menu, MenuItem } from '@mui/material';
import '../components/account-style.css'; 

function Accounts() {
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const [anchorEl, setAnchorEl] = useState(null); 

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

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = accounts
    .filter(account => {
      const isMatchingSearchTerm = account.account_username.toLowerCase().includes(searchTerm.toLowerCase());
      return isMatchingSearchTerm;
    })

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddAccount = () => {
    console.log(accounts);
  }

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSortOptionClick = (option) => {
    setAnchorEl(null); // Close the dropdown
  };

  const handleCloseDropdown = () => {
    setAnchorEl(null); // Close the dropdown when clicking outside
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
                placeholder="Search Accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="date-picker-container">
              <button className='btn-primary' onClick={handleAddAccount}>+ Add Account</button>
            </div>
          </header>
          <hr />

          <div className='account-list'>
            <div className='header-account d-flex justify-content-between'>
              <button className='btn-primary' onClick={handleFilterClick}>Accounts</button>
              <button><i className='bi bi-funnel'/> Filter</button>
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
                          <TableCell>Name</TableCell>
                          <TableCell>Email Address</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAccounts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((account) => (
                          <TableRow key={account.account_id}>
                            <TableCell>{account.account_username}</TableCell>
                            <TableCell>{account.account_email}</TableCell>
                            <TableCell>
                              <Button variant="outlined" color={getButtonColor(account.account_status)}>
                                {account.account_status}
                              </Button>
                            </TableCell>
                            <TableCell><button className='btn-primary'>Edit</button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                  <TablePagination
                    rowsPerPageOptions={[5, 10]}
                    component="div"
                    count={filteredAccounts.length}
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
            <MenuItem onClick={() => handleSortOptionClick("Accounts")}>Accounts</MenuItem>
            <MenuItem onClick={() => handleSortOptionClick("Employee")}>Employee</MenuItem>
          </Menu>
        </div>
      </div>
    </SidebarPOS>
  )
}

function getButtonColor(status) {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Inactive':
      return 'error';
    default:
      return 'default';
  }
}

export default Accounts