import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; 
import SidebarPOS from '../components/SidebarPOS';
import { usePOS } from '../api/POSProvider';
import '../components/customer-style.css'; 
import CustomerModal from '../components/CustomerModal';
import MainLayout from '../layout/MainLayout';

function CustomerPage() {
  const { selectedCustomer, setSelectedCustomer, isCustomerAdded, setIsCustomerAdded, selectedCustomerLocal, setSelectedCustomerLocal } = usePOS();
  const [recentCustomers, setRecentCustomers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    try {
      const result = await axios.get('http://localhost:5001/api/customer');
      setRecentCustomers(result.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomerLocal(customer);
    if (selectedCustomer && selectedCustomer.customer_id === customer.customer_id) {
      setIsCustomerAdded(true);
    } else {
      setIsCustomerAdded(false);
    }
  };

  const handleRemoveCustomer = () => {
    setIsCustomerAdded(false);
    setSelectedCustomer(null); 
    navigate('/customers'); 
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(selectedCustomerLocal)
    if (selectedCustomerLocal) {
      setIsCustomerAdded(true);
      navigate('/pos');
    }
  };

  const handleCloseCustomerModal = () => {
    setCustomerModalOpen(false);
  };

  const handleOpenEditModal = (selectedCustomerLocal) => {
      setEditMode(true);
      setCustomerToEdit(selectedCustomerLocal);
      setCustomerModalOpen(true);
  };

  const handleOpenAddModal = () => {
      setEditMode(false);
      setCustomerToEdit(null);
      setCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (customer) => {
    console.log('Saving customer:', customer);
    try {
      let newCustomer;

      if (customer.customer_id) {
        const response = await axios.put(`http://localhost:5001/api/customer/${customer.customer_id}`, customer);
        newCustomer = response.data;
        console.log(newCustomer);
      } else {
        const response = await axios.post('http://localhost:5001/api/customer', customer);
        newCustomer = response.data; 
        console.log(newCustomer); 
      }

      setRecentCustomers((prevCustomers) => {
        if (customer.customer_id) {
            return prevCustomers.map((c) =>
                c.customer_id === customer.customer_id ? customer : c
            );
        } else {
            return [customer, ...prevCustomers];
        }
      });

      setSelectedCustomer(newCustomer);
      setIsCustomerAdded(true);
      navigate('/pos');

    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer');
    }
  };  

  const handleDeleteCustomer = async () => {
    if (!selectedCustomerLocal) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedCustomerLocal.customer_name}?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5001/api/customer/${selectedCustomerLocal.customer_id}`);
      setRecentCustomers((prevCustomers) =>
        prevCustomers.filter((customer) => customer.customer_id !== selectedCustomerLocal.customer_id)
      );
      setSelectedCustomerLocal(null); 
      setSelectedCustomer(null);
      setIsCustomerAdded(false);
      alert('Customer deleted successfully');
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCustomers = recentCustomers
    .filter((customer) =>
      customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.customer_date) - new Date(a.customer_date));
  

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (location.state?.newCustomer) {
      const newCustomer = location.state.newCustomer;
      setRecentCustomers((prevCustomers) => [newCustomer, ...prevCustomers]);
      setSelectedCustomer(newCustomer);
      setSelectedCustomerLocal(newCustomer);
      setIsCustomerAdded(true);
    }
  }, [location.state?.newCustomer]);


  return (
    <>
      <MainLayout>
        <div className='row'>
          <div className="customer-page-container p-3">
            <header className="customer-page-header">
              <input 
                type="text" 
                className="search-bar" 
                placeholder="Search Customers..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="add-customer-btn" onClick={handleOpenAddModal}>+ Add New Customer</button>
            </header>

            <hr />

            <div className="customer-details">
              {selectedCustomerLocal ? (
                <div className="customer-info">
                  {selectedCustomerLocal.customer_profile ? (
                      <img 
                          src={selectedCustomerLocal.customer_profile} 
                          alt="Customer" 
                          style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                  ) : (
                      <i className="bi bi-person-circle"></i>
                  )}
                  <div className="customer-meta m-3">
                    <div className="customer-header">
                      <h2>{selectedCustomerLocal.customer_name}</h2>
                      <h2 className="customer-id">#{selectedCustomerLocal.customer_id}</h2>
                    </div>
                    <p style={{ marginBottom: '3px' }}><i class="bi bi-envelope"/> {selectedCustomerLocal.customer_email}</p>
                    <p style={{ marginTop: '0' }}><i class="bi bi-telephone"/> {selectedCustomerLocal.customer_number}</p>
                    <div className="customer-actions">
                      {isCustomerAdded ? (
                        <button className="remove-btn" onClick={handleRemoveCustomer}>Remove</button>
                      ) : (
                        <button className="add-btn" onClick={handleAddCustomer}>Add</button>
                      )}
                      <div className="edit-delete-buttons">
                        <button className="edit-btn" onClick={() => handleOpenEditModal(selectedCustomerLocal)}><i className='bi bi-pencil-square'/> Edit</button>
                      </div>                   
                    </div>
                  </div>
                </div>
              ) : (
                <div className="customer-info">
                  <p>No customer selected</p>
                </div>
              )}
            </div>
            <hr />
            <h3>Recent Customers</h3>
            <div className={selectedCustomerLocal ? 'recent-customers-scrollable' : 'recent-customers-scrollable-selected'}>
              {filteredCustomers.map((customer, index) => {
                // Convert the customer date to a readable format
                const formattedDate = new Date(customer.customer_date).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                });

                return (
                  <div 
                    key={index} 
                    className="recent-customer-item"
                    onClick={() => handleSelectCustomer(customer)}
                    style={{
                      backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                      borderRadius: '10px',
                    }}
                  >
                    <div className="row customer-detail">
                      <p className="customer-name">{customer.customer_name}</p>
                      <p className="customer-email">{customer.customer_email}</p>
                    </div>
                    <p className="customer-date">{formattedDate}</p> {/* Use the formatted date here */}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </MainLayout>

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        onSave={handleSaveCustomer}
        editMode={isEditMode}
        customerToEdit={customerToEdit}
      />
    </>
  );
}

export default CustomerPage;
