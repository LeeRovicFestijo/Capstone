const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sigbuilder',
    password: '12345678',
    port: 5433,
  });

// Basic route to test connection
app.get('/api/new-arrivals', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory ORDER BY item_id DESC LIMIT 15');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

app.get('/api/shop-items', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory ORDER BY item_id');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

app.get('/api/search-items', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory ORDER BY item_id');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body; 
  
    try {
      // Query PostgreSQL for employee accounts
      const result = await pool.query('SELECT * FROM customer_account WHERE customer_email = $1 AND customer_password = $2', [email, password]);
      const user = result.rows[0]; // Get the first matching user, if any
      if (user) {
        res.status(200).json({ message: 'Login successful', user });
      } else {
        res.status(401).json({ message: 'Invalid credentials', error });
      }
    } catch (error) {
      res.status(500).json({ message: 'Login failed. Incorrect username or Password.', error: error.message });
    }
});

app.post('/api/signup', async (req, res) => {
    const { fullName, address, number, email, password } = req.body;
  
    try {
      // Check if customer already exists in the customer table by email
      const customerResult = await pool.query('SELECT * FROM customer WHERE customer_email = $1', [email]);
      const accountResult = await pool.query('SELECT * FROM customer_account WHERE customer_email = $1', [email]);

      if (accountResult.rows.length > 0) {
        return res.status(400).json({ message: 'Email is already in use in customer account.' });
    }
  
      let customerId;
      if (customerResult.rows.length > 0) {
        // Customer exists, get their ID
        customerId = customerResult.rows[0].customer_id;
      } else {
        // Customer doesn't exist, insert a new customer row
        const newCustomer = await pool.query(
          'INSERT INTO customer (customer_name, customer_address, customer_number, customer_email, customer_date) VALUES ($1, $2, $3, $4, NOW()) RETURNING customer_id',
          [fullName, address, number, email]
        );
        customerId = newCustomer.rows[0].customer_id;
      }
  
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert into customer_account
      await pool.query(
        'INSERT INTO customer_account (customer_id, customer_email, customer_password) VALUES ($1, $2, $3)',
        [customerId, email, hashedPassword]
      );
  
      res.status(201).json({ message: 'Customer account created successfully' });
    } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).json({ message: 'Error creating customer account' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
