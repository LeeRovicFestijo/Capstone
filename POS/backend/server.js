const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5001;

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to validate user credentials
app.post('/api/login-pos', async (req, res) => {
  const { email, password } = req.body; // Change id to username

  try {
    // Query PostgreSQL for employee accounts
    const result = await pool.query('SELECT * FROM employee_account WHERE account_email = $1 AND account_password = $2', [email, password]);
    const user = result.rows[0]; // Get the first matching user, if any

    if (user) {
      // If a match is found, send success response
      res.status(200).json({ message: 'Login successful', user });
    } else {
      // If no match, send an error response
      res.status(401).json({ message: 'Invalid credentials', error });
    }
  } catch (error) {
    res.status(500).json({ message: 'Login failed. Incorrect username or Password.', error: error.message });
  }
});

app.get('/api/user_profile', async (req, res) => {
  const account_id = req.query.account_id;

  try {
    const result = await pool.query('SELECT * FROM employee_account WHERE account_id = $1', [account_id]);

    if (result.rows.length > 0) {
      const userProfile = result.rows[0];

      if (userProfile.account_profile) {
        // Convert Buffer to base64 string
        const base64Image = userProfile.account_profile.toString('base64');
        userProfile.account_profile = `data:image/jpeg;base64,${base64Image}`; // Adjust MIME type if necessary
      }
      res.status(200).json(userProfile); // Return the first row

    } else {
        res.status(404).json({ message: 'User not found' }); // Handle case where no user is found
    }
  } catch (error) {
      res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

app.post('/api/update-user-account', upload.single('account_profile'), async (req, res) => {
  const { account_id, employee_id, account_username, account_email } = req.body;
  const account_profile = req.file ? req.file.buffer : null;

  if (req.file && req.file.mimetype.startsWith('image/') || !req.file) {
      try {
          // Build the query dynamically based on whether account_profile is provided
          const updates = [
              account_username, 
              account_email, 
          ];
          let query = 'UPDATE employee_account SET account_username = $1, account_email = $2';
          
          // Only add account_profile to the query if it exists
          if (account_profile) {
              query += ', account_profile = $3';
              updates.push(account_profile); // Insert account_profile into the array
          }

          query += ` WHERE account_id = $${updates.length + 1} RETURNING *;`;
          updates.push(account_id);

          const accountUpdateResult = await pool.query(query, updates);

          const existingEmailCheck = await pool.query(
              'SELECT * FROM employee WHERE employee_email = $1 AND employee_id != $2',
              [account_email, employee_id]
          );

          if (existingEmailCheck.rows.length === 0) {
            
          }

          const employeeUpdateResult = await pool.query(
            'UPDATE employee SET employee_email = $1 WHERE employee_id = $2 RETURNING *',
            [account_email, employee_id]
          );

          res.status(200).json({
              account: accountUpdateResult.rows[0],
              employee: employeeUpdateResult.rows[0]
          });
      } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error updating profile', error: error.message });
      }
  } else {
      return res.status(400).json({ message: 'Invalid file type. Only images are allowed.' });
  }
});

app.post('/api/change-user-password', upload.none(), async (req, res) => {
  const { account_id, old_password, new_password, confirm_password } = req.body;

  // Validate input
  if (!account_id || !old_password || !new_password || !confirm_password) {
      return res.status(400).json({ message: 'All fields are required.' });
  }

  if (new_password !== confirm_password) {
      return res.status(400).json({ message: 'New and confirm password do not match.' });
  }

  try {
      // Fetch the current password from the database
      const result = await pool.query(
          'SELECT account_password FROM employee_account WHERE account_id = $1',
          [account_id]
      );

      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Admin not found.' });
      }

      const account = result.rows[0];

      // Compare old password with the stored hash
      if (old_password !== account.account_password) {
        return res.status(401).json({ message: 'Old password is incorrect.' });
      } 

      // Update the password in the database
      await pool.query(
          'UPDATE employee_account SET account_password = $1 WHERE account_id = $2',
          [new_password, account_id]
      );

      res.status(200).json({ message: 'Password changed successfully!' });
  } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Error changing password', error: error.message });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  const { id } = req.params; // Product ID from the URL
  const { quantity } = req.body; // New quantity

  try {
    const result = await pool.query(
      'UPDATE inventory SET stock = stock - $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]); // Return the updated product
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating inventory', error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
      const result = await pool.query('SELECT * FROM inventory ORDER BY item_id');
      res.status(200).json(result.rows);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

app.get('/api/customer', async (req, res) => {
  try {
      // Use LEFT JOIN to get all customers, even those without an account
      const result = await pool.query(`SELECT * FROM customer`);
      
      // Map through the customers and convert any binary profile image to base64
      const customers = result.rows.map(customer => {
          if (customer.customer_profile) {
              // Convert Buffer to base64 string
              const base64Image = customer.customer_profile.toString('base64');
              // Attach the base64 image string to the item object with proper MIME type
              customer.customer_profile = `data:image/jpeg;base64,${base64Image}`; // Adjust MIME type if necessary
          }
          return customer;
      });

      res.status(200).json(customers);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
});

app.get('/api/customer/email/:email', async (req, res) => {
  const { email } = req.params;
  const query = 'SELECT COUNT(*) FROM customer WHERE customer_email = $1';
  const result = await pool.query(query, [email]);

  if (result.rows[0].count > 0) {
    return res.json({ exists: true });
  }
  return res.json({ exists: false });
});

app.put('/api/customer/:id', async (req, res) => {
  const { id } = req.params; // Customer ID from the URL
  const { customer_name, customer_number, customer_email, customer_address, customer_date } = req.body; // New customer data
  console.log('Received credentials updating:', req.body);

  try {
    // Check if the email already exists
    const emailCheck = await pool.query(
      'SELECT * FROM customer WHERE customer_email = $1 AND customer_id != $2',
      [customer_email, id]
    );

    if (emailCheck.rows.length > 0) {
      // Email already used by another customer
      return res.status(400).json({ message: 'Email is already used by another customer' });
    }

    const accountCheck = await pool.query(
      'SELECT * FROM customer_account WHERE customer_id = $1',
      [id]
    );

    // Proceed with the update if email is unique
    const result = await pool.query(
      'UPDATE customer SET customer_name = $1, customer_number = $2, customer_email = $3, customer_address = $4, customer_date = $5 WHERE customer_id = $6 RETURNING *',
      [customer_name, customer_number, customer_email, customer_address, customer_date, id]
    );

    if (result.rows.length > 0) {
      if (accountCheck.rows.length > 0) {
        await pool.query(
          'UPDATE customer_account SET customer_email = $1 WHERE customer_id = $2',
          [customer_email, id]
        );
      }
      res.status(200).json(result.rows[0]); // Return the updated customer
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer', error: error.message });
  }
});

// Endpoint to add a new customer
app.post('/api/add-customer', async (req, res) => {
  const { customer_name, customer_number, customer_email, customer_address, customer_date } = req.body;

  try {
      // Check if the email already exists
      const emailCheck = await pool.query(
          'SELECT * FROM customer WHERE customer_email = $1',
          [customer_email]
      );

      if (emailCheck.rows.length > 0) {
          // Email already used
          return res.status(400).json({ message: 'Email is already used by another customer' });
      }

      // Insert new customer into the database
      const result = await pool.query(
          'INSERT INTO customer (customer_name, customer_number, customer_email, customer_address, customer_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [customer_name, customer_number, customer_email, customer_address, customer_date]
      );

      // Respond with the newly created customer
      res.status(201).json(result.rows[0]); // Return the new customer
  } catch (error) {
      console.error('Error adding customer:', error);
      res.status(500).json({ message: 'Error adding customer', error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const { customer_id, cart, total_amount, order_delivery, payment_mode, account_id, shipping_address } = req.body;

  try {
      // Check inventory stock
      for (let item of cart) {
          const { item_id, order_quantity } = item;
          const stockCheck = await pool.query('SELECT quality_stocks FROM inventory WHERE item_id = $1', [item_id]);

          if (stockCheck.rows[0].quality_stocks < order_quantity) {
              return res.status(400).json({ message: `Not enough stock for item ID: ${item_id}` });
          }
      }

      // Insert into Orders table
      const orderResult = await pool.query(
          'INSERT INTO orders (customer_id, total_amount, order_date, order_deliver, payment_mode, account_id) VALUES ($1, $2, NOW(), $3, $4, $5) RETURNING order_id',
          [customer_id, total_amount, order_delivery, payment_mode, account_id]
      );
      
      const order_id = orderResult.rows[0].order_id;

      for (let item of cart) {
        await pool.query(
            'INSERT INTO transactions (order_id, item_id, order_quantity) VALUES ($1, $2, $3)',
            [order_id, item.item_id, item.order_quantity]
        );
      }

      // Update inventory stock
      for (let item of cart) {
          await pool.query(
              'UPDATE inventory SET quality_stocks = quality_stocks - $1 WHERE item_id = $2',
              [item.order_quantity, item.item_id]
          );
      }

      // If order is for delivery, add to Shipment table
      if (order_delivery === 'yes') {
          await pool.query(
              'INSERT INTO shipment (order_id, shipping_address, shipping_status) VALUES ($1, $2, $3)',
              [order_id, shipping_address, 'Pending']
          );
      }

      res.status(200).json({ message: 'Order created successfully' });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/transaction', async (req, res) => {
  try {
      const result = await pool.query('SELECT o.order_id, o.customer_id, o.total_amount, o.order_date, o.order_deliver, o.account_id, o.payment_mode, c.customer_name  FROM orders o LEFT JOIN customer c ON o.customer_id = c.customer_id ORDER BY o.order_id DESC');
      res.status(200).json(result.rows);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

app.get('/api/order-details', async (req, res) => {
  const { order_id } = req.query;

  const query = `
    SELECT 
      t.order_id, 
      t.item_id, 
      t.order_quantity, 
      i.item_description, 
      i.unit_price, 
      i.unit_measurement, 
      (t.order_quantity * i.unit_price) AS total_amount
    FROM 
      transactions t
    JOIN 
      inventory i ON t.item_id = i.item_id
    JOIN 
      orders o ON t.order_id = o.order_id
    WHERE t.order_id = $1
  `;

  try {
    const result = await pool.query(query, [order_id]);
    res.status(200).json(result.rows);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching order details', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
