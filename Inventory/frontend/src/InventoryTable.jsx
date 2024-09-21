import React, { useState, useEffect } from 'react';
import './InventoryTable.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const InventoryTable = () => {
    const [inventoryData, setInventoryData] = useState([]);
    const [formData, setFormData] = useState({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    // Fetch inventory data from the server on component mount
    useEffect(() => {
        fetch('/api/inventory')
            .then(response => response.json())
            .then(data => {
                setInventoryData(data);
                setFilteredData(data); // Initialize filtered data
            })
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

        // Ensure that numeric values are properly converted
        const unitPrice = parseFloat(formData.unitPrice);
        const qualityStocks = parseInt(formData.qualityStocks, 10);

        const itemData = { 
            item_description: formData.itemDescription, // Update the key to match the server side
            unit_price: unitPrice, 
            quality_stocks: qualityStocks, 
            unit_measurement: formData.unitMeasurement
        };

        console.log(itemData);
        console.log(editId);

        const requestUrl = editId ? `http://localhost:5000/api/inventory/${editId}` : 'http://localhost:5000/api/inventory';
        const method = editId ? 'PUT' : 'POST';

        if (!editId) {
            // Generate a new unique primary key for the new item
            const newId = inventoryData.length > 0 ? Math.max(...inventoryData.map(item => item.id)) + 1 : 1;
            itemData.id = newId; // Assuming 'id' is your primary key
        }

        console.log(requestUrl);

        // Send data to the server (either create or update)
        fetch(requestUrl, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save item');
            }
            return response.json();
        })
        .then(savedItem => {
            if (editId) {
                // Update the existing item in both inventoryData and filteredData
                const updatedInventory = inventoryData.map(item => item.id === savedItem.id ? savedItem : item);
                setInventoryData(updatedInventory);
                setFilteredData(updatedInventory); // Update filtered data as well
            } else {
                // For new item, append to both inventoryData and filteredData
                setInventoryData([...inventoryData, savedItem]);
                setFilteredData([...inventoryData, savedItem]); // Update filtered data after adding
            }
            // Reset form after success
            setFormData({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
            setEditId(null);
            alert('Item added successfully!');
            setFilteredData([...inventoryData, savedItem]); // Update filtered data after adding
        })
        .catch(err => {
            console.error('Error saving item:', err);
            alert('There was an error saving the item. Please try again.');
        });
    };

    const handleUpdateItem = () => {
        // Check if form inputs are valid
        if (!formData.itemDescription || !formData.unitPrice || !formData.qualityStocks || !formData.unitMeasurement) {
            alert('Please fill in all fields.');
            return;
        }
    
        // Ensure that numeric values are properly converted
        const unitPrice = parseFloat(formData.unitPrice);
        const qualityStocks = parseInt(formData.qualityStocks, 10);
    
        const itemData = { 
            item_description: formData.itemDescription,
            unit_price: unitPrice, 
            quality_stocks: qualityStocks, 
            unit_measurement: formData.unitMeasurement
        };
    
        // Update the item in the backend
        const requestUrl = `http://localhost:5000/api/inventory/${editId}`;
        fetch(requestUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update item');
            }
            return response.json();
        })
        .then(updatedItem => {
            // Update the item in inventoryData and filteredData
            const updatedInventory = inventoryData.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            );
            setInventoryData(updatedInventory);
            setFilteredData(updatedInventory); // Also update filtered data
    
            // Reset the form
            setFormData({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
            setEditId(null);
            alert('Item updated successfully!');
        })
        .catch(err => {
            console.error('Error updating item:', err);
            alert('There was an error updating the item. Please try again.');
        });
    };
    

    const handleEditItem = (item) => {
        console.log(item);
        setFormData({
            itemDescription: item.item_description, // Match the key from the server
            unitPrice: item.unit_price,
            qualityStocks: item.quality_stocks,
            unitMeasurement: item.unit_measurement,
        });
        setEditId(item.id);
    };

    const handleDeleteItem = (id) => {
        fetch(`http://localhost:5000/api/inventory/${id}`, { method: 'DELETE' })
        .then(() => {
            setInventoryData(inventoryData.filter(item => item.id !== id));
            setFilteredData(filteredData.filter(item => item.id !== id)); // Also update filtered data
        })
        .catch(err => console.error('Error deleting item:', err));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearch = () => {
        // Filter the inventory based on the search term
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = inventoryData.filter(item => 
            item.item_description.toLowerCase().includes(lowercasedFilter) // Match the key from the server
        );
        setFilteredData(filtered);
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
                    placeholder="Measurement"
                    value={formData.unitMeasurement}
                    onChange={handleInputChange}
                    className="form-control d-inline-block mx-2"
                    style={{ width: '150px' }}
                />
                {editId ? ( 
                    <button onClick={handleUpdateItem} className="btn btn-primary d-inline-block mx-2">
                        Update
                    </button>
                ) : (
                    <button onClick={handleAddItem} className="btn btn-primary d-inline-block mx-2">
                        Add
                    </button>)}
            </div>

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Item Description</th>
                        <th>Unit Price</th>
                        <th>Quality in Stocks</th>
                        <th>Unit of Measurement</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map(item => (
                        <tr key={item.id}>
                            <td>{item.item_description}</td> {/* Update to match key */}
                            <td>{item.unit_price}</td>
                            <td>{item.quality_stocks}</td>
                            <td>{item.unit_measurement}</td>
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
