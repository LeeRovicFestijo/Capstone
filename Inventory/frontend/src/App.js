import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Import Router components
import Sidebar from './Sidebar';  // Sidebar component
import InventoryTable from './InventoryTable';  // Your InventoryTable component
import Dashboard from './pages/Dashboard';  // Assuming Dashboard.jsx is in /pages directory
import PointOfSale from './pages/PointOfSale';  // Point of Sale page
import Reports from './pages/Reports';  // Reports page
import SiteManagement from './pages/SiteManagement';  // Site Management page
import Shipment from './pages/Shipment';  // Shipment page
import Accounts from './pages/Accounts';  // Accounts page

function App() {
    return (
        <Router>
            <div className="container">
                <Sidebar />  {/* Sidebar remains visible across all pages */}
                
                <div className="content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />  {/* Default route */}
                        <Route path="/dashboard" element={<Dashboard />} />  {/* Dashboard route */}
                        <Route path="/pos" element={<PointOfSale />} />  {/* Point of Sale page */}
                        <Route path="/inventory" element={<InventoryTable />} />  {/* Inventory page */}
                        <Route path="/reports" element={<Reports />} />  {/* Reports page */}
                        <Route path="/site-management" element={<SiteManagement />} />  {/* Site Management page */}
                        <Route path="/shipment" element={<Shipment />} />  {/* Shipment page */}
                        <Route path="/accounts" element={<Accounts />} />  {/* Accounts page */}
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
