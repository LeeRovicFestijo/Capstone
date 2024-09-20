const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5001;

// Endpoint to validate user credentials
app.post('/api/login', async (req, res) => {
  const { id, password } = req.body; // Change id to username
  console.log('Received credentials:', req.body);

  try {
    // Fetch the employee accounts from the JSON server
    const response = await axios.get('http://localhost:5000/employee_account');
    const accounts = response.data;

    const user = accounts.find(account => {
      console.log('Checking account:', account.id); // Log the current username being checked
      return account.id === id && account.password === password;
    });

    if (user) {
      // If a match is found, send success response
      res.status(200).json({ message: 'Login successful', user });
    } else {
      // If no match, send an error response
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
