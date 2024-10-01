const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5001;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sigbuilder',
  password: '12345678',
  port: 5433,
});

// Endpoint to validate user credentials
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body; // Change id to username
  console.log('Received credentials:', req.body);

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
      const result = await pool.query('SELECT * FROM customer');
      console.log('Fetched customers:', result.rows);
      res.status(200).json(result.rows);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
});

app.delete('/api/customer/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM customer WHERE customer_id = $1', [id]);
    res.status(200).send('Customer deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting customer');
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

    // Proceed with the update if email is unique
    const result = await pool.query(
      'UPDATE customer SET customer_name = $1, customer_number = $2, customer_email = $3, customer_address = $4, customer_date = $5 WHERE customer_id = $6 RETURNING *',
      [customer_name, customer_number, customer_email, customer_address, customer_date, id]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]); // Return the updated customer
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer', error: error.message });
  }
});

// Endpoint to add a new customer
app.post('/api/customer', async (req, res) => {
  const { customer_name, customer_number, customer_email, customer_address, customer_date } = req.body;
  console.log('Received credentials adding:', req.body);
  console.log('Received credentials adding:', customer_name);

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
  console.log('Received credentials payment:', req.body);

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

app.get('/api/accounts', async (req, res) => {
  try {
      const result = await pool.query('SELECT * FROM employee_account ORDER BY account_id');
      res.status(200).json(result.rows);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
      const result = await pool.query('SELECT * FROM employee ORDER BY employee_id');
      res.status(200).json(result.rows);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

app.post('/api/add_account', async (req, res) => {
  const { account_username, account_password, account_role, account_status, account_email } = req.body;
  console.log('Received credentials adding account:', req.body);

  try {
    // Check if the email is already used
    const emailCheck = await pool.query(
      'SELECT * FROM employee_account WHERE account_email = $1',
      [account_email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email is already used by another account' });
    }

    const employeeResult = await pool.query(
      'SELECT employee_id FROM employee WHERE employee_email = $1',
      [account_email]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const employee_id = employeeResult.rows[0].employee_id;

    // Insert the new account
    const result = await pool.query(
      'INSERT INTO employee_account (employee_id, account_username, account_password, account_role, account_status, account_email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [employee_id, account_username, account_password, account_role, account_status, account_email]
    );

    res.status(201).json({ message: 'Account added successfully', account: result.rows[0] });
  } catch (error) {
    console.error('Error adding account:', error);
    res.status(500).json({ message: 'Error adding account', error: error.message });
  }
});

app.put('/api/accounts/:id', async (req, res) => {
  const { id } = req.params;
  const { account_username, account_password, account_role, account_status, account_email } = req.body;

  try {
    const accountResult = await pool.query(
      'UPDATE employee_account SET account_username = $1, account_password = $2, account_role = $3, account_status = $4, account_email = $5 WHERE account_id = $6 RETURNING *',
      [account_username, account_password, account_role, account_status, account_email, id]
    );
    if (accountResult.rowCount === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const { employee_id, account_email: updatedAccountEmail } = accountResult.rows[0];

    // Now, update the employee table using the employee_id and account_email
    const employeeResult = await pool.query(
      'UPDATE employee SET employee_email = $1 WHERE employee_id = $2 RETURNING *',
      [updatedAccountEmail, employee_id]
    );

    res.status(200).json({
      updatedAccount: accountResult.rows[0],
      updatedEmployee: employeeResult.rows[0],
    });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/add_employee', async (req, res) => {
  const { employee_name, employee_age, employee_address, employee_number, employee_email } = req.body;
  console.log('Received credentials adding employee:', req.body);
  console.log('Received credentials adding employee:', employee_name);

  try {
    const emailCheck = await pool.query(
        'SELECT * FROM employee WHERE employee_email = $1',
        [employee_email]
    );

    if (emailCheck.rows.length > 0) {
        // Email already used
        return res.status(400).json({ message: 'Email is already used by another employee' });
    }

    const result = await pool.query(
        'INSERT INTO employee (employee_name, employee_age, employee_address, employee_number, employee_email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [employee_name, employee_age, employee_address, employee_number, employee_email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ message: 'Error adding employee', error: error.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { employee_name, employee_email, employee_address, employee_age, employee_number } = req.body;

  try {
    const employeeResult = await pool.query(
      'UPDATE employee SET employee_name = $1, employee_email = $2, employee_address = $3, employee_age = $4, employee_number = $5 WHERE employee_id = $6 RETURNING *',
      [employee_name, employee_email, employee_address, employee_age, employee_number, id]
    );
    if (employeeResult.rowCount === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const { employee_id, employee_email: updatedEmployeeEmail } = employeeResult.rows[0];

    // Now, update the employee table using the employee_id and account_email
    const accountResult = await pool.query(
      'UPDATE employee_account SET account_email = $1 WHERE employee_id = $2 RETURNING *',
      [updatedEmployeeEmail, employee_id]
    );

    res.status(200).json({
      updatedAccount: accountResult.rows[0],
      updatedEmployee: employeeResult.rows[0],
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
