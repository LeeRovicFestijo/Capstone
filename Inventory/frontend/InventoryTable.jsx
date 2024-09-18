import React, { useState, useEffect } from 'react';
import './InventoryTable.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const InventoryTable = () => {
    const [inventoryData, setInventoryData] = useState([]);
    const [formData, setFormData] = useState({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch inventory data from the server
    useEffect(() => {
        fetch('/api/inventory')
            .then(response => response.json())
            .then(data => setInventoryData(data))
            .catch(err => console.error('Error fetching inventory:', err));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleAddItem = () => {
        // Check if form inputs are valid
        if (!formData.itemDescription || !formData.unitPrice || !formData.qualityStocks || !formData.unitMeasurement) {
            alert('Please fill in all fields.');
            return;
        }
    
        // Calculate the total cost
        const calculatedTotalCost = (formData.unitPrice * formData.qualityStocks).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
    
        const itemData = { 
            itemDescription: formData.itemDescription, 
            unitPrice: Number(formData.unitPrice), 
            qualityStocks: Number(formData.qualityStocks), 
            unitMeasurement: formData.unitMeasurement, 
            totalCost: calculatedTotalCost 
        };
    
        console.log('Item data to be sent:', itemData); // For debugging
    
        // Check if we're editing or adding a new item
        if (editId) {
            // Update item in the database
            fetch(`/api/inventory/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData),
            })
            .then(response => response.json())
            .then(updatedItem => {
                setInventoryData(inventoryData.map(item => (item.id === editId ? updatedItem : item)));
                setEditId(null);
                setFormData({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
            })
            .catch(err => console.error('Error updating item:', err));
        } else {
            // Add new item to the database
            fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add item');
                }
                return response.json();
            })
            .then(newItem => {
                setInventoryData([...inventoryData, newItem]);
                setFormData({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
                console.log('Item added successfully:', newItem); // Debugging log
            })
            .catch(err => console.error('Error adding item:', err));
        }
    };
    

    const handleEditItem = (item) => {
        setFormData({
            itemDescription: item.item_description,
            unitPrice: item.unit_price,
            qualityStocks: item.quality_stocks,
            unitMeasurement: item.unit_measurement,
        });
        setEditId(item.id);
    };

    const handleDeleteItem = (id) => {
        // Delete item from the database
        fetch(`/api/inventory/${id}`, {
            method: 'DELETE',
        })
            .then(() => {
                setInventoryData(inventoryData.filter(item => item.id !== id));
            })
            .catch(err => console.error('Error deleting item:', err));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearch = () => {
        // Implement search functionality (optional)
        alert(`Search for: ${searchTerm}`);
    };

    return (
        <div className="content">
            <div className="d-flex justify-content-between align-items-center my-4">
                <h1>Inventory</h1>
                <div className="d-flex">
                    <input
                        type="text"
                        placeholder="Search items"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="form-control mx-2"
                        style={{ width: '250px' }}
                    />
                    <button onClick={handleSearch} className="btn btn-primary mx-2">Search</button>
                </div>
            </div>

            <div className="inventory-form my-4">
                <input
                    type="text"
                    name="itemDescription"
                    placeholder="Item Description"
                    value={formData.itemDescription}
                    onChange={handleInputChange}
                    className="form-control d-inline-block mx-2"
                    style={{ width: '200px' }}
                />
                <input
                    type="number"
                    name="unitPrice"
                    placeholder="Unit Price"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    className="form-control d-inline-block mx-2"
                    style={{ width: '150px' }}
                />
                <input
                    type="number"
                    name="qualityStocks"
                    placeholder="Quality in Stocks"
                    value={formData.qualityStocks}
                    onChange={handleInputChange}
                    className="form-control d-inline-block mx-2"
                    style={{ width: '150px' }}
                />
                <input
                    type="text"
                    name="unitMeasurement"
                    placeholder="Unit of Measurement"
                    value={formData.unitMeasurement}
                    onChange={handleInputChange}
                    className="form-control d-inline-block mx-2"
                    style={{ width: '150px' }}
                />
                <button 
                    onClick={handleAddItem} 
                    className="btn btn-primary d-inline-block mx-2"
                >
                    {editId ? 'Update' : 'Add'}
                </button>
            </div>

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Item Description</th>
                        <th>Unit Price</th>
                        <th>Quality in Stocks</th>
                        <th>Unit of Measurement</th>
                        <th>Total Cost</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {inventoryData.map(item => (
                        <tr key={item.id}>
                            <td>{item.item_description}</td>
                            <td>{item.unit_price}</td>
                            <td>{item.quality_stocks}</td>
                            <td>{item.unit_measurement}</td>
                            <td>{item.total_cost}</td>
                            <td>
                                <button className="btn btn-warning btn-sm mx-1" onClick={() => handleEditItem(item)}>Edit</button>
                                <button className="btn btn-danger btn-sm mx-1" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryTable;
