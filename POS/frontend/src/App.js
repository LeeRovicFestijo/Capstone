import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POSPage';
import CustomerPage from './pages/CustomerPage';
import TransactionPage from './pages/TransactionPage';
import { POSProvider } from './api/POSProvider';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

function App() {
  return (
    <POSProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage/>} />
          <Route path="/pos" element={<POSPage/>} />
          <Route path="/customers" element={<CustomerPage/>} />
          <Route path="/transactions" element={<TransactionPage/>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </Router>
    </POSProvider>
    
  );
}

export default App;
