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
    database: 'sigbuilder',
    password: '$Andrei1515',
    port: 5432,
});

// GET all inventory items
app.get('/api/inventory', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching inventory items:', err.message);
        res.status(500).send('Server Error');
    }
});

// POST a new inventory item
app.post('/api/inventory', async (req, res) => {
    const { itemDescription, unitPrice, qualityStocks, unitMeasurement, totalCost } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO inventory (item_description, unit_price, quality_stocks, unit_measurement, total_cost) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [itemDescription, unitPrice, qualityStocks, unitMeasurement, totalCost]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error adding item:', err.message);
        res.status(500).send('Server Error');
    }
});

// PUT (update) an inventory item
app.put('/api/inventory/:id', async (req, res) => {
    const { id } = req.params;
    const { itemDescription, unitPrice, qualityStocks, unitMeasurement, totalCost } = req.body;
    try {
        const result = await pool.query(
            'UPDATE inventory SET item_description = $1, unit_price = $2, quality_stocks = $3, unit_measurement = $4, total_cost = $5 WHERE id = $6 RETURNING *',
            [itemDescription, unitPrice, qualityStocks, unitMeasurement, totalCost, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating item:', err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE an inventory item
app.delete('/api/inventory/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM inventory WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting item:', err.message);
        res.status(500).send('Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
