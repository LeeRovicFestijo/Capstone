const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL Pool Configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sigbuilder', // Make sure this matches your DB name
    password: '$Andrei1515', // Ensure your password is correct
    port: 5432,
});

// POST route to add a new inventory item
app.post('/api/inventory', async (req, res) => {
    const { itemDescription, unitPrice, qualityStocks, unitMeasurement, totalCost } = req.body;

    console.log('Received data for POST /api/inventory:', req.body);  // Debugging: Log received data

    try {
        // Check if required fields are present
        if (!itemDescription || !unitPrice || !qualityStocks || !unitMeasurement || !totalCost) {
            console.log('Missing required fields'); // Debugging: Log if fields are missing
            return res.status(400).json({ msg: 'Please provide all required fields.' });
        }

        // Insert the item into the database
        const result = await pool.query(
            'INSERT INTO inventory (item_description, unit_price, quality_stocks, unit_measurement, total_cost) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [itemDescription, unitPrice, qualityStocks, unitMeasurement, totalCost]
        );

        console.log('Insert successful:', result.rows[0]);  // Debugging: Log success message and inserted data
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error inserting item:', err.message);  // Debugging: Log the actual error message
        res.status(500).send('Server Error');
    }
});

// GET route to fetch all inventory items
app.get('/api/inventory', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching inventory items:', err.message);
        res.status(500).send('Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
