import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; 
import SidebarPOS from '../components/SidebarPOS';
import { usePOS } from '../api/POSProvider';
import '../components/customer-style.css'; 
import CustomerModal from '../components/CustomerModal';

function CustomerPage() {
  const { selectedCustomer, setSelectedCustomer, isCustomerAdded, setIsCustomerAdded, selectedCustomerLocal, setSelectedCustomerLocal } = usePOS();
  const [recentCustomers, setRecentCustomers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('customer');
      setRecentCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomerLocal(customer);
    if (selectedCustomer && selectedCustomer.id === customer.id) {
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

  const handleOpenCustomerModal = () => {
    setCustomerModalOpen(true);
  };

  const handleCloseCustomerModal = () => {
    setCustomerModalOpen(false);
  };

  const handleSaveCustomer = (customer) => {
    setRecentCustomers((prevCustomers) => [customer, ...prevCustomers]);
    setSelectedCustomer(customer);
    setIsCustomerAdded(true);
    navigate('/pos'); 
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCustomers = recentCustomers.filter((customer) =>
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <SidebarPOS>
        <div className='row' style={{height: '91vh'}}>
          <div className="customer-page-container p-3 border bordery-gray rounded-right">
            <header className="customer-page-header">
              <input 
                type="text" 
                className="search-bar" 
                placeholder="Search Customers..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="add-customer-btn" onClick={handleOpenCustomerModal}>+ Add New Customer</button>
            </header>

            <hr />

            <div className="customer-details">
              {selectedCustomerLocal ? (
                <div className="customer-info">
                  {selectedCustomerLocal.profilePicture ? (
                      <img 
                          src={selectedCustomerLocal.profilePicture} 
                          alt="Customer" 
                          style={{ width: '200px', height: '200px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                  ) : (
                      <i className="bi bi-person-circle"></i>
                  )}
                  <div className="customer-meta m-3">
                    <div className="customer-header">
                      <h2>{selectedCustomerLocal.fullName}</h2>
                      <h2 className="customer-id">#{selectedCustomerLocal.id}</h2>
                    </div>
                    <p style={{ marginBottom: '3px' }}><i class="bi bi-envelope"/> {selectedCustomerLocal.emailAddress}</p>
                    <p style={{ marginTop: '0' }}><i class="bi bi-telephone"/> {selectedCustomerLocal.phoneNumber}</p>
                    <div className="customer-actions">
                      {isCustomerAdded ? (
                        <button className="remove-btn" onClick={handleRemoveCustomer}>Remove</button>
                      ) : (
                        <button className="add-btn" onClick={handleAddCustomer}>Add</button>
                      )}
                      <div className="edit-delete-buttons">
                        <button className="edit-btn"><i className='bi bi-pencil-square'/> Edit</button>
                        <button className="delete-btn"><i className='bi bi-trash'/> Delete</button>
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
            <div className="recent-customers-scrollable">
              {filteredCustomers.map((customer, index) => (
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
                    <p className="customer-name">{customer.fullName}</p>
                    <p className="customer-email">{customer.emailAddress}</p>
                  </div>
                  <p className="customer-date">{customer.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SidebarPOS>

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        onSave={handleSaveCustomer}
      />
    </>
  );
}

export default CustomerPage;
