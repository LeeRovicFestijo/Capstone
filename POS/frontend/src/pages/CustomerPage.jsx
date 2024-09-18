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
      console.log("Selected Customer4:", selectedCustomer);
      console.log(isCustomerAdded) 
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
    console.log("Selected Customer2:", selectedCustomerLocal);
  };

  const handleRemoveCustomer = () => {
    setIsCustomerAdded(false);
    setSelectedCustomer(null); 
    navigate('/customers'); 
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(selectedCustomerLocal)
    if (selectedCustomerLocal) {
      console.log("Selected Customer1:", selectedCustomer);
      setIsCustomerAdded(true);
      navigate('/pos');
      console.log(isCustomerAdded) 
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
        <div className="customer-page-container">
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
                <img 
                  src={selectedCustomerLocal.profilePicture || "https://via.placeholder.com/150"} 
                  alt="Customer" 
                  className="customer-image"
                />
                <div className="customer-meta">
                  <div className="customer-header">
                    <h2>{selectedCustomerLocal.fullName}</h2>
                    <h2 className="customer-id">#{selectedCustomerLocal.id}</h2>
                  </div>
                  <p>{selectedCustomerLocal.emailAddress}</p>
                  <p>{selectedCustomerLocal.phoneNumber}</p>
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
          <h3>Recent Customers</h3>
          <div className="recent-customers-scrollable">
            {filteredCustomers.map((customer, index) => (
              <div 
                key={index} 
                className="recent-customer-item"
                onClick={() => handleSelectCustomer(customer)}
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
