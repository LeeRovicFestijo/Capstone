const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();
const multer = require('multer');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('./models/User');
const sequelize = require('./config/database');
const { Op } = require('sequelize');
const axios = require('axios');

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

const app = express();
const PORT = 5001;

(async () => {
    try {
      await sequelize.sync();
      console.log('Database & tables created!');
    } catch (err) {
      console.error('Error syncing the database:', err);
    }
})();

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'margarett.morissette@ethereal.email',
        pass: 'uwHZD9aZnc1DU65VXm'
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection pool
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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Basic route to test connection
app.get('/api/new-arrivals', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory ORDER BY item_id DESC LIMIT 15');
        
        // Loop through the result rows to convert the item_image buffer to base64
        const items = result.rows.map(item => {
            if (item.item_image) {
                // Convert Buffer to base64 string
                const base64Image = item.item_image.toString('base64');
                // Attach the base64 image string to the item object with proper MIME type
                item.item_image = `data:image/jpeg;base64,${base64Image}`; // Adjust MIME type if necessary
            }
            return item;
        });

        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
});

app.get('/api/top-items-ecommerce', async (req, res) => {
    try {
        // First query to get top items of the month
        const topItemsResult = await pool.query(`
            SELECT 
                i.item_id, 
                i.item_description,
                i.unit_price,
                i.quality_stocks,
                i.unit_measurement,
                i.item_image,
                SUM(t.order_quantity) AS total_sales 
            FROM transactions t
            JOIN inventory i ON t.item_id = i.item_id
            JOIN orders o ON o.order_id = t.order_id
            WHERE 
                o.order_date >= DATE_TRUNC('month', CURRENT_DATE) -- Get transactions from the start of the current month
                AND o.order_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' -- Until the start of the next month
            GROUP BY i.item_id
            ORDER BY total_sales DESC
            LIMIT 15
        `);

        // If there are no top items, get a random 15 items from the inventory
        let items;
        if (topItemsResult.rows.length < 15) {
            const randomItemsResult = await pool.query(`
                SELECT 
                    i.item_id, 
                    i.item_description,
                    i.unit_price,
                    i.quality_stocks,
                    i.unit_measurement,
                    i.item_image 
                FROM inventory i
                ORDER BY RANDOM()
                LIMIT 15
            `);
            items = randomItemsResult.rows;
        } else {
            items = topItemsResult.rows;
        }

        // Convert item_image to base64 if present
        items = items.map(item => {
            if (item.item_image) {
                // Convert Buffer to base64 string
                const base64Image = item.item_image.toString('base64');
                // Attach the base64 image string to the item object with proper MIME type
                item.item_image = `data:image/jpeg;base64,${base64Image}`; // Adjust MIME type if necessary
            }
            return item;
        });

        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching top items:', error);
        res.status(500).json({ message: 'Error fetching top items' });
    }
});

app.get('/api/shop-items', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory ORDER BY item_id');
        
        // Loop through the result rows to convert the item_image buffer to base64
        const items = result.rows.map(item => {
            if (item.item_image) {
                // Convert Buffer to base64 string
                const base64Image = item.item_image.toString('base64');
                // Attach the base64 image string to the item object with proper MIME type
                item.item_image = `data:image/jpeg;base64,${base64Image}`; // Adjust MIME type if necessary
            }
            return item;
        });

        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
});

app.get('/api/search-items', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory');
        
        // Loop through the result rows to convert the item_image buffer to base64
        const items = result.rows.map(item => {
            if (item.item_image) {
                // Convert Buffer to base64 string
                const base64Image = item.item_image.toString('base64');
                // Attach the base64 image string to the item object with proper MIME type
                item.item_image = `data:image/jpeg;base64,${base64Image}`; // Adjust MIME type if necessary
            }
            return item;
        });

        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // First, fetch the user from the customer_account table
      const result = await pool.query('SELECT * FROM customer_account WHERE customer_email = $1', [email]);
      const user = result.rows[0];
  
      // Check if user exists
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Check if password matches (assuming you're using bcrypt)
      const isPasswordValid = await bcrypt.compare(password, user.customer_password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // If valid, fetch customer details
      const customerId = user.customer_id;
      const customerResult = await pool.query(
        'SELECT c.customer_id, c.customer_name, c.customer_address, c.customer_number, c.customer_email, c.customer_date, c.customer_profile, ca.customer_account_id, ca.customer_password FROM customer c JOIN customer_account ca ON c.customer_id = ca.customer_id WHERE c.customer_id = $1',
        [customerId]
      );
  
      const customer = customerResult.rows[0];
  
      // Check if customer exists
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

    if (customer.customer_profile) {
        // Convert Buffer to base64 string
        const base64Image = customer.customer_profile.toString('base64');
        customer.customer_profile = `data:image/jpeg;base64,${base64Image}`; // Adjust MIME type if necessary
    }
  
      // Send response with customer data
      res.status(200).json({ message: 'Login successful', customer });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
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

app.get('/api/customer_profile', async (req, res) => {
    const customer_id = req.query.customer_id;
  
    try {
      const result = await pool.query('SELECT c.customer_id, c.customer_name, c.customer_address, c.customer_number, c.customer_email, c.customer_date, c.customer_profile, ca.customer_account_id, ca.customer_password FROM customer c JOIN customer_account ca ON c.customer_id = ca.customer_id WHERE c.customer_id = $1', [customer_id]);
  
      if (result.rows.length > 0) {
        const customerProfile = result.rows[0];
  
        if (customerProfile.customer_profile) {
          // Convert Buffer to base64 string
          const base64Image = customerProfile.customer_profile.toString('base64');
          customerProfile.customer_profile = `data:image/jpeg;base64,${base64Image}`; // Adjust MIME type if necessary
        }

        res.status(200).json(customerProfile); // Return the first row
  
      } else {
          res.status(404).json({ message: 'Customer not found' }); // Handle case where no user is found
      }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer', error: error.message });
    }
});

app.post('/api/update-customer-account', upload.single('customer_profile'), async (req, res) => {
    const { customer_id, customer_name, customer_email, customer_address, customer_number } = req.body;
    const customer_profile = req.file ? req.file.buffer : null;
  
    if (!req.file || (req.file && req.file.mimetype.startsWith('image/'))) {
        try {
            // Build the query dynamically based on whether account_profile is provided
            const updates = [
                customer_name, 
                customer_email, 
                customer_address,
                customer_number,
            ];
            let query = 'UPDATE customer SET customer_name = $1, customer_email = $2, customer_address = $3, customer_number = $4';
            
            // Only add account_profile to the query if it exists
            if (customer_profile) {
                query += ', customer_profile = $5';
                updates.push(customer_profile); // Insert account_profile into the array
            }
  
            query += ` WHERE customer_id = $${updates.length + 1} RETURNING *;`;
            updates.push(customer_id);
  
            const customerUpdateResult = await pool.query(query, updates);
  
            const accountUpdateResult = await pool.query(
                'UPDATE customer_account SET customer_email = $1 WHERE customer_id = $2 RETURNING *',
                [customer_email, customer_id]
            );
  
            res.status(200).json({
                account: accountUpdateResult.rows[0],
                customer: customerUpdateResult.rows[0]
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating profile', error: error.message });
        }
    } else {
        return res.status(400).json({ message: 'Invalid file type. Only images are allowed.' });
    }
});

app.post('/api/change-customer-password', upload.none(), async (req, res) => {
    const { customer_id, old_password, new_password, confirm_password } = req.body;

    // Validate input
    if (!customer_id || !old_password || !new_password || !confirm_password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (new_password !== confirm_password) {
        return res.status(400).json({ message: 'New and confirm password do not match.' });
    }

    try {
        // Fetch the current password from the database
        const result = await pool.query(
            'SELECT customer_password FROM customer_account WHERE customer_id = $1',
            [customer_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        const customer = result.rows[0];

        // Compare old password with the stored hash
        const isMatch = await bcrypt.compare(old_password, customer.customer_password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Old password is incorrect.' });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(new_password, 10);

        // Update the password in the database
        await pool.query(
            'UPDATE customer_account SET customer_password = $1 WHERE customer_id = $2',
            [hashedNewPassword, customer_id]
        );

        res.status(200).json({ message: 'Password changed successfully!' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
});

app.post('/api/check-stock', async (req, res) => {
    const { cart } = req.body; // Assuming cart is an array of objects with item_id and order_quantity

    try {
        // Extract item_ids and quantities from the cart
        const itemIds = cart.map(item => item.item_id);
        
        // Fetch all stocks at once
        const stockCheck = await pool.query(
            'SELECT item_id, quality_stocks FROM inventory WHERE item_id = ANY($1::int[])',
            [itemIds]
        );

        const stockMap = new Map();
        stockCheck.rows.forEach(row => {
            stockMap.set(row.item_id, row.quality_stocks);
        });

        const itemsOutOfStock = [];

        // Check against the requested quantities
        for (let item of cart) {
            const { item_id, order_quantity, item_description } = item;
            const available_quantity = stockMap.get(item_id);

            // Ensure the stock exists in the database and check quantities
            if (available_quantity === undefined || available_quantity < order_quantity) {
                itemsOutOfStock.push({
                    item_description,
                    requested_quantity: order_quantity,
                    available_quantity: available_quantity || 0, // Default to 0 if undefined
                });
            }
        }

        if (itemsOutOfStock.length > 0) {
            return res.status(400).json({
                message: 'Some items do not have enough stock',
                items_out_of_stock: itemsOutOfStock,
            });
        }

        res.status(200).json({ message: 'All items in stock.' });
    } catch (error) {
        console.error('Error checking stock:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/api/e-orders', async (req, res) => {
    const { customer_id, cart, total_amount, order_delivery, payment_mode, account_id, shipping_address, payment_status } = req.body;
  
    try {
        const paymentResult = await pool.query('UPDATE payment SET payment_status = $1 WHERE customer_id = $2', ['paid', customer_id])

        if (paymentResult.rowCount === 0) {
            return res.status(400).json({ message: 'No payment found for the customer' });
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
                'INSERT INTO shipment (order_id, shipping_address, shipping_status, payment_status) VALUES ($1, $2, $3, $4)',
                [order_id, shipping_address, 'Pending', payment_status]
            );
        }
  
        res.status(200).json({ message: 'Order created successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/order-history-customer', async (req, res) => {
    const { customer_id } = req.query;
    try {
        // SQL query to retrieve order history with shipment status
        const query = `
            SELECT 
            o.order_id, 
            o.order_date, 
            o.total_amount, 
            s.shipping_status,
            s.payment_status
            FROM 
            orders o
            JOIN 
            shipment s ON o.order_id = s.order_id
            WHERE 
            o.customer_id = $1
            ORDER BY o.order_date DESC;
        `;
        
        // Execute the query
        const result = await pool.query(query, [customer_id]);

        // Send back the order history data as JSON
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).json({ error: 'An error occurred while fetching order history' });
    }
});
  
app.get('/api/order-details-customer', async (req, res) => {
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

app.post('/api/forgot-password-customer', async (req, res) => {
    const { email } = req.body;
  
    // Check if user exists
    const user = await User.findOne({ where: { customer_email: email } });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
  
    // Generate token and expiration
    const token = crypto.randomBytes(32).toString('hex');
    user.reset_token = token;
    user.reset_token_expiration = Date.now() + 3600000; // 1 hour
    await user.save();
  
    // Send email
    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      html: `<p>You requested a password reset</p><p>Click this <a href="${resetUrl}">link</a> to set a new password.</p>`,
    });
  
    res.send({ message: 'Password reset link sent' });
});

app.post('/api/reset-password-customer', async (req, res) => {
    const { password, token } = req.body;
  
    // Find user by token and check expiration
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expiration: { [Op.gt]: Date.now() }, // Use Op.gt for Sequelize
      },
    });
  
    if (!user) {
      return res.status(400).send({ message: 'Token is invalid or expired' });
    }
  
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
  
    // Update password and clear token
    user.customer_password = hashedPassword; // Save the hashed password
    user.reset_token = undefined; // Clear the reset token
    user.reset_token_expiration = undefined; // Clear the token expiration
    await user.save(); // Save the updated user
  
    res.send({ message: 'Password has been reset' });
});

const generateRandomId = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
};

app.post('/api/create-gcash-checkout-session', async (req, res) => {
    const { customer_id, lineItems } = req.body;

    const formattedLineItems = lineItems.map((product) => {
        return {
            currency: 'PHP',
            amount: Math.round(product.unit_price * 100), 
            name: product.item_description,
            quantity: product.quantity,
        };
    });

    const randomId = generateRandomId(28);

    try {
        const response = await axios.post(
            'https://api.paymongo.com/v1/checkout_sessions',
            {
                data: {
                    attributes: {
                        send_email_receipt: false,
                        show_line_items: true,
                        line_items: formattedLineItems, 
                        payment_method_types: ['gcash'],
                        success_url: `https://website.sigbuilders.app/success?session_id=${randomId}`,
                        cancel_url: 'https://website.sigbuilders.app/cancel',
                    },
                },
            },
            {
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY).toString('base64')}`, 
                },
            }
        );

        const checkoutUrl = response.data.data.attributes.checkout_url;

        if (!checkoutUrl) {
            return res.status(500).json({ error: 'Checkout URL not found in response' });
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // UPSERT query
            const query = `
                INSERT INTO payment (customer_id, session_id, payment_status)
                VALUES ($1, $2, $3)
                ON CONFLICT (customer_id) 
                DO UPDATE SET 
                    session_id = EXCLUDED.session_id,
                    payment_status = EXCLUDED.payment_status;
            `;
            const values = [customer_id, randomId, 'pending'];

            await client.query(query, values);
            await client.query('COMMIT'); // Commit the transaction
        } catch (error) {
            await client.query('ROLLBACK'); // Rollback in case of error
            console.error('Error inserting/updating payment:', error.message);
            return res.status(500).json({ error: 'Failed to insert/update payment', details: error.message });
        } finally {
            client.release(); // Release the connection back to the pool
        }

        res.status(200).json({ url: checkoutUrl });
    } catch (error) {
        console.error('Error creating checkout session:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to create checkout session', details: error.response ? error.response.data : error.message });
    }
});

app.get('/api/check-payment-status/:customer_id', async (req, res) => {
    const { customer_id } = req.params;

    try {
        const client = await pool.connect();
        const query = 'SELECT session_id, payment_status FROM payment WHERE customer_id = $1';
        const result = await client.query(query, [customer_id]);

        if (result.rows.length > 0) {
            const { session_id, payment_status } = result.rows[0];
            res.status(200).json({ session_id, payment_status });
        } else {
            res.status(200).json({ exists: false });1
        }

        client.release();
    } catch (error) {
        console.error('Error checking payment status:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
