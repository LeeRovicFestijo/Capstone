import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; 
import SidebarPOS from '../components/SidebarPOS';
import { usePOS } from '../api/POSProvider';
import '../components/customer-style.css'; 
import CustomerModal from '../components/CustomerModal';

function CustomerPage() {
  const { selectedCustomer, setSelectedCustomer, isCustomerAdded, setIsCustomerAdded } = usePOS();
  const [recentCustomers, setRecentCustomers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);

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
    setSelectedCustomer(customer);
    setIsCustomerAdded(false);
    console.log("Selected Customer2:", selectedCustomer);
  };

  const handleRemoveCustomer = () => {
    setIsCustomerAdded(false);
    setSelectedCustomer(null); 
    navigate('/customers'); 
  };

  const handleAddCustomer = () => {
    if (selectedCustomer) {
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
    // Save the new customer and add them to the recent customers list
    setRecentCustomers((prevCustomers) => [customer, ...prevCustomers]);
    setSelectedCustomer(customer);
    setIsCustomerAdded(true);
    navigate('/pos'); // Optionally navigate back to POS after saving
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (location.state?.newCustomer) {
      const newCustomer = location.state.newCustomer;
      setRecentCustomers((prevCustomers) => [newCustomer, ...prevCustomers]);
      setSelectedCustomer(newCustomer);
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
            />
            <button className="add-customer-btn" onClick={handleOpenCustomerModal}>+ Add New Customer</button>
          </header>

          <hr />

          <div className="customer-details">
            {selectedCustomer ? (
              <div className="customer-info">
                <img 
                  src={selectedCustomer.profilePicture || "https://via.placeholder.com/150"} 
                  alt="Customer" 
                  className="customer-image"
                />
                <div className="customer-meta">
                  <h2>{selectedCustomer.fullName}</h2>
                  <p>{selectedCustomer.id}</p>
                  <p>{selectedCustomer.emailAddress}</p>
                  <p>{selectedCustomer.phoneNumber}</p>
                </div>
                <div className="customer-actions">
                  {isCustomerAdded ? (
                    <button className="remove-btn" onClick={handleRemoveCustomer}>Remove</button>
                  ) : (
                    <button className="add-btn" onClick={handleAddCustomer}>Add</button>
                  )}
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn">Delete</button>
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
            {recentCustomers.map((customer, index) => (
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
