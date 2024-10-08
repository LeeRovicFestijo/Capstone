const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors({ origin: 'http://localhost:3000' })); // Allow requests from React



// PostgreSQL connection configuration
//  const pool = new Pool({
//      user: 'postgres',
//      host: 'localhost',
//      database: 'sigbuilder',
//      password: '$Andrei1515',
//      port: 5432, 
//  });

const pool = new Pool({
   user: 'postgres',
      host: 'localhost',
   database: 'sigbuilder',
   password: '12345678',
   port: 5433,
 });

app.use(bodyParser.json());

app.post('/api/login-admin', async (req, res) => {
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

app.get('/api/admin_profile', async (req, res) => {
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

app.post('/api/update-admin-account', upload.single('account_profile'), async (req, res) => {
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

app.get('/api/inventory', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM inventory ORDER BY item_id'); // Adjust the table name
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).send('Error fetching products');
    }
  });

// Add a new inventory item
app.post('/api/inventory', upload.single('item_image'), async (req, res) => {
    const { item_description, unit_price, quality_stocks, unit_measurement } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    // Validation check
    if (!item_description || isNaN(unit_price) || isNaN(quality_stocks) || !unit_measurement) {
        return res.status(400).json({ error: 'Invalid data. Please check your inputs.' });
    }

    if (req.file && req.file.mimetype.startsWith('image/') || !req.file) {
        try {
            // The image is in memory, we can access it as a buffer

            const query = `
                INSERT INTO inventory (item_description, unit_price, quality_stocks, unit_measurement, item_image)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
            `;

            const result = await pool.query(query, [
                item_description,
                parseFloat(unit_price),
                parseInt(quality_stocks, 10),
                unit_measurement,
                imageBuffer
            ]);

            const newItem = result.rows[0];
            res.status(201).json(newItem);
        } catch (err) {
            console.error('Error saving item:', err);
            res.status(500).json({ error: 'Database error. Failed to save item.' });
        }
    } else {
        return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' });
    }
});

// Update an inventory item
app.put('/api/inventory/:id', upload.single('item_image'), async (req, res) => {
    const { id } = req.params; // Use id for clarity
    const { item_description, unit_price, quality_stocks, unit_measurement } = req.body;
    const item_image = req.file ? req.file.buffer : null;

    // Validation check
    if (!item_description || isNaN(unit_price) || isNaN(quality_stocks) || !unit_measurement) {
        return res.status(400).json({ error: 'Invalid data. Please check your inputs.' });
    }

    if (req.file && req.file.mimetype.startsWith('image/') || !req.file) {
        try {
            // Build the query dynamically based on whether account_profile is provided
            const updates = [item_description, parseFloat(unit_price), parseInt(quality_stocks, 10), unit_measurement];
            let query = `
                UPDATE inventory
                SET item_description = $1, unit_price = $2, quality_stocks = $3, unit_measurement = $4
            `;
            
            // Only add account_profile to the query if it exists
            if (item_image) {
                query += ', item_image = $5';
                updates.push(item_image); // Insert account_profile into the array
            }
  
            query += ` WHERE item_id = $${updates.length + 1} RETURNING *;`;
            updates.push(id);

            const result = await pool.query(query, updates);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Item not found.' });
            }

            const updatedItem = result.rows[0];
            res.json(updatedItem);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating inventory', error: error.message });
        }
    } else {
        return res.status(400).json({ message: 'Invalid file type. Only images are allowed.' });
    }
});


// Delete an inventory item
app.delete('/api/inventory/:id', (req, res) => {
    const { id } = req.params;

    pool.query('DELETE FROM inventory WHERE item_id = $1', [id])
        .then(result => {
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Item not found.' });
            }
            res.status(204).send(); // No content
        })
        .catch(err => {
            console.error('Error deleting item:', err);
            res.status(500).json({ error: 'Failed to delete item.' });
        });
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
    const { account_username, account_role, account_status, account_email } = req.body;
  
    try {
      const accountResult = await pool.query(
        'UPDATE employee_account SET account_username = $1, account_role = $2, account_status = $3, account_email = $4 WHERE account_id = $7 RETURNING *',
        [account_username, account_role, account_status, account_email, id]
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

app.get('/api/shipment-order', async (req, res) => {
    try {
      const query = `
        SELECT 
            sh.shipment_id,
            sh.order_id,
            o.order_date,
            o.total_amount,
            o.payment_mode,
            sh.shipping_address,
            sh.shipping_status,
            c.customer_id,
            c.customer_name
        FROM 
            shipment sh
        JOIN 
            orders o ON sh.order_id = o.order_id
        JOIN 
            customer c ON o.customer_id = c.customer_id
        GROUP BY 
            sh.shipment_id, 
            sh.order_id, 
            o.order_date, 
            o.total_amount, 
            o.payment_mode, 
            sh.shipping_address, 
            sh.shipping_status, 
            c.customer_id, 
            c.customer_name;
      `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shipment orders', error: error.message });
    }
});
  
app.put('/api/shipment-order/:id', async (req, res) => {
    const order_id = req.params.id; // Get the order ID from the URL
    const { shipping_status } = req.body; // Get the new status from the request body
  
    try {
      const result = await pool.query(
        'UPDATE shipment SET shipping_status = $1 WHERE order_id = $2 RETURNING *',
        [shipping_status, order_id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.status(200).json(result.rows[0]); // Send back the updated order
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});
  
app.get('/api/shipment-details', async (req, res) => {
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

app.get('/api/customer-report', async (req, res) => {
  try {
      const result = await pool.query('SELECT * FROM customer');
      console.log('Fetched customers:', result.rows);
      res.status(200).json(result.rows);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
});

app.get('/api/transaction-report', async (req, res) => {
  try {
      const result = await pool.query('SELECT o.order_id, o.customer_id, o.total_amount, o.order_date, o.order_deliver, o.account_id, o.payment_mode, c.customer_name  FROM orders o LEFT JOIN customer c ON o.customer_id = c.customer_id ORDER BY o.order_id DESC');
      res.status(200).json(result.rows);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

app.get('/api/order-details-report', async (req, res) => {
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

app.post('/api/change-admin-password', upload.none(), async (req, res) => {
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

// Start the server
// const port = 5000;
const port = 5001;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
