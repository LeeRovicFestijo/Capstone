import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Import Router components
import InventoryTable from './pages/InventoryTable';  // Your InventoryTable component
import Dashboard from './pages/Dashboard';  // Assuming Dashboard.jsx is in /pages directory
import Reports from './pages/Reports';  // Reports page
import Shipment from './pages/Shipment';  // Shipment page
import Accounts from './pages/Accounts';  // Accounts page
import LoginPage from './pages/LoginPage';
import { InventoryProvider } from './api/InventoryProvider';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

function App() {
    return (
        <InventoryProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LoginPage />} /> 
                    <Route path="/dashboard" element={<Dashboard />} /> 
                    <Route path="/inventory" element={<InventoryTable />} />  
                    <Route path="/reports" element={<Reports />} /> 
                    <Route path="/shipment" element={<Shipment />} /> 
                    <Route path="/accounts" element={<Accounts />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Routes>
            </Router>
        </InventoryProvider>
    );
}

export default App;
