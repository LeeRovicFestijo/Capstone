const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('File must be an image'));
    }
    cb(null, true);
  }
});

app.use(cors()); 

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.use(bodyParser.json());

app.post('/api/login-admin', async (req, res) => {
  const { email, password } = req.body; 

  try {
    // Query PostgreSQL for employee accounts
    const result = await pool.query('SELECT * FROM employee_account WHERE account_email = $1 AND account_password = $2', [email, password]);
    const user = result.rows[0]; // Get the first matching user, if any

    if (user) {
      if (user.account_profile) {
        // Convert Buffer to base64 string
        const base64Image = user.account_profile.toString('base64');
        user.account_profile = `data:image/jpeg;base64,${base64Image}`; // Adjust MIME type if necessary
      }

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
        'UPDATE employee_account SET account_username = $1, account_role = $2, account_status = $3, account_email = $4 WHERE account_id = $5 RETURNING *',
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
            sh.payment_status
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
            c.customer_name
        ORDER BY 
            sh.order_id DESC;
      `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shipment orders', error: error.message });
    }
});
  
app.put('/api/shipment-order/:id', async (req, res) => {
    const order_id = req.params.id; 
    const { shipping_status } = req.body; 
  
    try {
      if (shipping_status === 'Cancelled') {
          const itemsQuery = `
              SELECT 
                  item_id, 
                  order_quantity 
              FROM 
                  transactions 
              WHERE 
                  order_id = $1;
          `;
          const itemsResult = await pool.query(itemsQuery, [order_id]);

          // Restore the stock for each item
          for (const item of itemsResult.rows) {
              const restoreQuery = `
                  UPDATE inventory 
                  SET quantity_stocks = quantity_stocks + $1 
                  WHERE item_id = $2;
              `;
              await pool.query(restoreQuery, [item.order_quantity, item.item_id]);
          }
      }

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

app.put('/api/shipment-payment-status/:id', async (req, res) => {
  const order_id = req.params.id; 
  const { payment_status } = req.body; 

  try {
    const result = await pool.query(
      'UPDATE shipment SET payment_status = $1 WHERE order_id = $2 RETURNING *',
      [payment_status, order_id]
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

app.put('/api/shipment-payment-mode/:id', async (req, res) => {
  const order_id = req.params.id; 
  const { payment_mode } = req.body; 

  try {
    const result = await pool.query(
      'UPDATE orders SET payment_mode = $1 WHERE order_id = $2 RETURNING *',
      [payment_mode, order_id]
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

app.get("/api/getYears", async (req, res) => {
  try {
    const result = await pool.query("SELECT DISTINCT EXTRACT(YEAR FROM order_date) AS year FROM orders");
    const years = result.rows.map((row) => row.year);
    res.json({ years });
  } catch (error) {
    console.error("Error fetching years:", error);
    res.status(500).json({ error: "Failed to fetch years" });
  }
});

app.get('/api/customer-report', async (req, res) => {
  const { year, month } = req.query;

  try {
      // Start with a base query that selects all customers
      let query = `SELECT * FROM customer WHERE 1=1`;

      // Add filtering by year if it's provided and not 'All Year'
      if (year && year !== 'All Year') {
          query += ` AND EXTRACT(YEAR FROM customer_date) = ${year}`;
      }

      // Add filtering by month if it's provided and not 'All Month'
      if (month && month !== 'All Month') {
          query += ` AND EXTRACT(MONTH FROM customer_date) = ${new Date(Date.parse(month +" 1, 2023")).getMonth() + 1}`;
      }

      query += ` ORDER BY customer_id`;

      const result = await pool.query(query);
      res.json(result.rows);
  } catch (error) {
      console.error('Error fetching customer report:', error);
      res.status(500).send('Server error');
  }
});

app.get('/api/transaction-report', async (req, res) => {
  const { year, month } = req.query;

  try {
    let query = `
      SELECT o.order_id, o.customer_id, o.total_amount, o.order_date, 
             o.order_deliver, o.account_id, o.payment_mode, c.customer_name  
      FROM orders o 
      LEFT JOIN customer c ON o.customer_id = c.customer_id
      LEFT JOIN shipment s ON o.order_id = s.order_id 
      WHERE (s.shipping_status IS NULL OR s.shipping_status != 'Cancelled')`;

    if (year && year !== 'All Year') {
      query += ` AND EXTRACT(YEAR FROM o.order_date) = ${year}`;
    }

    if (month && month !== 'All Month') {
      const monthNumber = new Date(Date.parse(`${month} 1, 2023`)).getMonth() + 1; 
      query += ` AND EXTRACT(MONTH FROM o.order_date) = ${monthNumber}`;
    }

    query += ` ORDER BY o.order_id`;

    const result = await pool.query(query);  
    res.status(200).json(result.rows); 
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

app.get('/api/inventory-performance', async (req, res) => {
  const { year, month } = req.query;

  try {
    let query = `
      SELECT 
        i.item_id,
        i.item_description, 
        SUM(t.order_quantity * i.unit_price) AS total_sales, 
        SUM(t.order_quantity) AS total_items_sold
      FROM transactions t
      JOIN inventory i ON t.item_id = i.item_id
      JOIN orders o ON t.order_id = o.order_id
      LEFT JOIN shipment s ON o.order_id = s.order_id  -- Include all orders with LEFT JOIN
      WHERE (s.shipping_status IS NULL OR s.shipping_status != 'Cancelled')  -- Exclude cancelled orders, include orders not in shipment
    `;

    // Add year filter if selected
    if (year && year !== 'All Year') {
      query += ` AND EXTRACT(YEAR FROM o.order_date) = ${year}`;
    }

    // Add month filter if selected
    if (month && month !== 'All Month') {
      const monthNumber = new Date(Date.parse(`${month} 1, 2023`)).getMonth() + 1;
      query += ` AND EXTRACT(MONTH FROM o.order_date) = ${monthNumber}`;
    }

    query += ` GROUP BY i.item_id, i.item_description ORDER BY total_sales DESC`;

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory performance', error: error.message });
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

app.get('/api/total-sales-dashboard', async (req, res) => {
  try {
      const result = await pool.query(`
          SELECT 
              SUM(t.order_quantity * i.unit_price) AS total_sales
          FROM transactions t
          JOIN inventory i ON t.item_id = i.item_id
          JOIN orders o ON o.order_id = t.order_id
          LEFT JOIN shipment s ON s.order_id = o.order_id
          WHERE o.order_date >= DATE_TRUNC('year', CURRENT_DATE)
            AND ((s.shipping_status != 'Cancelled' AND s.payment_status = 'Paid') OR s.shipping_status IS NULL);
      `);
      const totalSales = result.rows[0]?.total_sales || 0;
      res.status(200).json({ total_sales: totalSales });
  } catch (error) {
      console.error('Error fetching sales data:', error);
      res.status(500).json({ message: 'Error fetching sales data' });
  }
});

app.get('/api/total-customer-dashboard', async (req, res) => {
  try {
      const result = await pool.query('SELECT COUNT(*) FROM customer');
      const totalCustomers = result.rows[0].count;
      res.status(200).json({ totalCustomers });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
  }
});

app.get('/api/active-shipments-dashboard', async (req, res) => {
  try {
      const result = await pool.query(
          `SELECT COUNT(*) FROM shipment WHERE shipping_status NOT IN ('Delivered', 'Cancelled')`
      );
      const activeShipments = result.rows[0].count;
      res.status(200).json({ activeShipments });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
  }
});

app.get('/api/sales-data', async (req, res) => {
  try {
    const result = await pool.query(`
      WITH months AS (
          SELECT 
              TO_CHAR(date_trunc('month', generate_series), 'Month') AS sales_month,
              EXTRACT(MONTH FROM generate_series) AS month_number
          FROM generate_series(
              date_trunc('year', NOW()),
              date_trunc('month', NOW()),
              INTERVAL '1 month'
          )
      )
      SELECT 
          m.sales_month,
          m.month_number,
          COALESCE(SUM(t.order_quantity * i.unit_price), 0) AS total_sales
      FROM months m
      LEFT JOIN orders o ON EXTRACT(MONTH FROM o.order_date) = m.month_number
      LEFT JOIN transactions t ON o.order_id = t.order_id
      LEFT JOIN inventory i ON t.item_id = i.item_id
      LEFT JOIN shipment s ON s.order_id = o.order_id AND (s.shipping_status IS NULL OR (s.shipping_status != 'Cancelled' AND s.payment_status = 'Paid'))
      WHERE o.order_date >= DATE_TRUNC('year', NOW())
      GROUP BY m.sales_month, m.month_number
      ORDER BY m.month_number;
    `);

    const formattedData = [
      {
        id: 'Sales',  
        data: result.rows.map(row => ({
          x: row.sales_month.trim(),  
          y: parseFloat(row.total_sales)  
        }))
      }
    ];

    // Send the formatted data
    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({ message: 'Error fetching sales data' });
  }
});

app.get('/api/top-items-dashboard', async (req, res) => {
  try {
      const result = await pool.query(`
          SELECT 
              i.item_id, 
              i.item_description,
              SUM(t.order_quantity) AS total_sales 
          FROM transactions t
          JOIN inventory i ON t.item_id = i.item_id
          JOIN orders o ON o.order_id = t.order_id
          LEFT JOIN shipment s ON s.order_id = o.order_id 
          WHERE 
              o.order_date >= DATE_TRUNC('month', CURRENT_DATE) 
              AND o.order_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' 
              AND ((s.shipping_status != 'Cancelled' AND s.payment_status = 'Paid') OR s.shipping_status IS NULL) 
          GROUP BY i.item_id
          ORDER BY total_sales DESC
          LIMIT 5;
      `);
      res.status(200).json(result.rows);
  } catch (error) {
      console.error('Error fetching top items:', error);
      res.status(500).json({ message: 'Error fetching top items' });
  }
});

app.get('/api/sales-by-payment-mode', async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT 
            o.payment_mode, 
            SUM(t.order_quantity * i.unit_price) AS total_sales
        FROM orders o
        JOIN transactions t ON o.order_id = t.order_id
        JOIN inventory i ON t.item_id = i.item_id
        LEFT JOIN shipment s ON s.order_id = o.order_id  
        WHERE ((s.shipping_status != 'Cancelled' AND s.payment_status = 'Paid') OR s.shipping_status IS NULL)  
        GROUP BY o.payment_mode;
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching sales by payment mode:', error);
    res.status(500).json({ message: 'Error fetching sales data' });
  }
});

app.get('/api/recent-orders-dashboard', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM orders ORDER BY order_id DESC LIMIT 10`);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching sales by payment mode:', error);
    res.status(500).json({ message: 'Error fetching sales data' });
  }
});

app.get('/api/restock-dashboard', async (req, res) => {
  try {

    const query = ` 
      -- Place the complete SQL query here
      WITH OrderToSale AS (
          SELECT 
              t.item_id,
              o.order_id,
              o.order_date
          FROM 
              orders o
          LEFT JOIN 
              transactions t ON o.order_id = t.order_id
      ),
      InventoryValues AS (
          SELECT 
              i.item_id,
              i.item_description,
              i.quality_stocks, -- Current stock levels
              COALESCE(SUM(t.order_quantity), 0) AS total_quantity_sold, -- Total quantity sold for each item
              i.unit_price,
              (i.unit_price * COALESCE(SUM(t.order_quantity), 0)) AS total_value, -- Total value of sales
              7 AS lead_time, -- Lead time is fixed at 7 days
              4000 AS ordering_cost
          FROM 
              inventory i
          LEFT JOIN 
              transactions t ON i.item_id = t.item_id
          LEFT JOIN 
              orders o ON t.order_id = o.order_id
          WHERE 
              o.order_date >= CURRENT_DATE - INTERVAL '2 years' -- Limit to the last 2 years based on order_date
          GROUP BY 
              i.item_id, i.unit_price, i.quality_stocks
      ),
      -- Step 2: Calculate EOQ, reorder point, and identify restock items
      EOQAnalysis AS (
          SELECT
              item_id,
              item_description,
              quality_stocks, -- Current stock levels
              total_quantity_sold,
              FLOOR(SQRT((2 * total_quantity_sold * ordering_cost) / 25000)) AS eoq, -- EOQ calculation rounded to nearest integer
              (total_quantity_sold / 365) * lead_time AS lead_time_demand, -- Demand during the fixed 7-day lead time
              25 AS safety_stock, -- Fixed safety stock value
              ((total_quantity_sold / 365) * lead_time) + 25 AS reorder_point -- ROP = lead time demand + safety stock
          FROM 
              InventoryValues
      ),
      -- Step 3: Perform ABC classification
      RankedInventory AS (
          SELECT
              i.item_id,
              i.item_description,
              i.unit_price,
              COALESCE(SUM(t.order_quantity), 0) AS total_quantity_sold,  -- Handle unsold items
              COALESCE((i.unit_price * SUM(t.order_quantity)), 0) AS total_value -- Handle unsold items
          FROM 
              inventory i
          LEFT JOIN 
              transactions t ON i.item_id = t.item_id
          LEFT JOIN 
              orders o ON t.order_id = o.order_id
          WHERE 
              o.order_date >= CURRENT_DATE - INTERVAL '1 year' OR o.order_date IS NULL -- Include items with no orders
          GROUP BY 
              i.item_id, i.unit_price
      ), RankedInventoryWithTotal AS (
          SELECT
              * ,
              RANK() OVER (ORDER BY total_value DESC) AS rank_value,
              SUM(total_value) OVER () AS total_inventory_value -- Total value of all items
          FROM
              RankedInventory
      ),
      ABCClassification AS (
          SELECT
              item_id,
              item_description,
              unit_price,
              total_quantity_sold,
              total_value,
              total_value / total_inventory_value * 100 AS value_percentage,
              CASE
                  WHEN total_value / total_inventory_value * 100 >= 80 THEN 'A'
                  WHEN total_value / total_inventory_value * 100 >= 50 THEN 'B'
                  ELSE 'C'
              END AS abc_classification
          FROM
              RankedInventoryWithTotal
      ),
      -- Step 4: Combine EOQ analysis with ABC classification and check for restocking
      RestockItems AS (
          SELECT
              e.item_id,
              e.item_description,
              e.quality_stocks,
              e.reorder_point,
              e.eoq,
              a.abc_classification,
              CASE
                  WHEN e.quality_stocks < e.reorder_point THEN 'Yes'
                  ELSE 'No'
              END AS needs_restock
          FROM
              EOQAnalysis e
          LEFT JOIN 
              ABCClassification a ON e.item_id = a.item_id
      )
      -- Final query: Return items that need restocking with ABC classification
      SELECT
          item_id,
          item_description,
          quality_stocks,
          reorder_point,
          eoq,
          abc_classification,
          needs_restock
      FROM
          RestockItems
      WHERE 
          needs_restock = 'Yes'
      ORDER BY
          abc_classification, reorder_point DESC;
      `;
      const result = await pool.query(query);

      res.status(200).json(result.rows);
  } catch (error) {
      console.error('Error fetching inventory data:', error);
      res.status(500).json({ message: 'Error fetching inventory data' });
  }
});

// Start the server
const port = process.env.PORT || 5001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
