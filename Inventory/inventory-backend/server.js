const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors({ origin: 'http://localhost:3000' })); // Allow requests from React



// PostgreSQL connection configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sigbuilder',
    password: '$Andrei1515',
    port: 5432, // Default PostgreSQL port
});

app.use(bodyParser.json());

// Fetch all inventory items
app.get('/api/inventory', (req, res) => {
    pool.query('SELECT * FROM inventory', (err, result) => {
        console.log(result)
        if (err) {
            console.error('Error fetching inventory:', err);
            return res.status(500).json({ error: 'Failed to fetch inventory.' });
        }
        res.json(result.rows);
    });
});

// Add a new inventory item
app.post('/api/inventory', (req, res) => {
    console.log('Data received from React:', req.body); // Log the incoming data

    const { item_description, unit_price, quality_stocks, unit_measurement } = req.body;
    console.log(item_description);

    // Validation check
    if (!item_description || isNaN(unit_price) || isNaN(quality_stocks) || !unit_measurement) {
        return res.status(400).json({ error: 'Invalid data. Please check your inputs.' });
    }

    const query = `
        INSERT INTO inventory (item_description, unit_price, quality_stocks, unit_measurement)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;

    pool.query(query, [item_description, parseFloat(unit_price), parseInt(quality_stocks, 10), unit_measurement])
        .then(result => {
            const newItem = result.rows[0];
            res.status(201).json(newItem);
        })
        .catch(err => {
            console.error('Error saving item:', err);
            res.status(500).json({ error: 'Database error. Failed to save item.' });
        });
});


// Update an inventory item
app.put('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    const { item_description, unit_price, quality_stocks, unit_measurement } = req.body;

    if (!item_description || isNaN(unit_price) || isNaN(quality_stocks) || !unit_measurement) {
        return res.status(400).json({ error: 'Invalid data. Please check your inputs.' });
    }

    const query = `
        UPDATE inventory
        SET item_description = $1, unit_price = $2, quality_stocks = $3, unit_measurement = $4
        WHERE id = $5
        RETURNING *;
    `;

    pool.query(query, [item_description, parseFloat(unit_price), parseInt(quality_stocks, 10), unit_measurement, id])
        .then(result => {
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Item not found.' });
            }
            const updatedItem = result.rows[0];
            res.json(updatedItem);
        })
        .catch(err => {
            console.error('Error updating item:', err);
            res.status(500).json({ error: 'Failed to update item.' });
        });
});

// Delete an inventory item
app.delete('/api/inventory/:id', (req, res) => {
    const { id } = req.params;

    pool.query('DELETE FROM inventory WHERE id = $1', [id])
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

// Start the server
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
