import React, { useState, useEffect } from 'react';
import './InventoryTable.css';
import axios from "axios"
import 'bootstrap/dist/css/bootstrap.min.css';

const InventoryTable = () => {
    const [inventoryData, setInventoryData] = useState([]);
    const [formData, setFormData] = useState({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    const fetchInventory = async () => {
        setIsLoading(true);
        console.log(isLoading);
        console.log('tt');
        try {
            const result = await axios.get('http://localhost:5000/api/inventory'); 
            setInventory(result.data); 
            setFilteredData(result.data);
            setInventoryData(result.data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleAddinventory = () => {
        // Check if form inputs are valid
        if (!formData.itemDescription || !formData.unitPrice || !formData.qualityStocks || !formData.unitMeasurement) {
            alert('Please fill in all fields.');
            return;
        }

        // Ensure that numeric values are properly converted
        const unitPrice = parseFloat(formData.unitPrice);
        const qualityStocks = parseInt(formData.qualityStocks, 10);

        const newInventoryData = { 
            item_description: formData.itemDescription, // Update the key to match the server side
            unit_price: unitPrice, 
            quality_stocks: qualityStocks, 
            unit_measurement: formData.unitMeasurement
        };

        const requestUrl = editId ? `http://localhost:5000/api/inventory/${editId}` : 'http://localhost:5000/api/inventory';
        const method = editId ? 'PUT' : 'POST';

        console.log(requestUrl);

        // Send data to the server (either create or update)
        fetch(requestUrl, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newInventoryData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save inventory');
            }
            return response.json();
        })
        .then(savedinventory => {
            if (editId) {
                // Update the existing inventory
                const updatedInventory = inventoryData.map(inventory => 
                    inventory.id === savedinventory.id ? savedinventory : inventory
                );
                setInventoryData(updatedInventory);
                setFilteredData(updatedInventory);
            } else {
                // Append new inventory
                const updatedInventory = [...inventoryData, savedinventory];
                setInventoryData(updatedInventory);
                setFilteredData(updatedInventory);
                fetchInventory(); // Optionally refetch the inventory
            }
            // Reset form after success
            setFormData({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
            setEditId(null);
            alert('Inventory added successfully!');
        })        
        .catch(err => {
            console.error('Error saving inventory:', err);
            alert('There was an error saving the inventory. Please try again.');
        });
    };

    const handleUpdateinventory = () => {
        // Check if form inputs are valid
        if (!formData.itemDescription || !formData.unitPrice || !formData.qualityStocks || !formData.unitMeasurement) {
            alert('Please fill in all fields.');
            return;
        }
    
        // Ensure that numeric values are properly converted
        const unitPrice = parseFloat(formData.unitPrice);
        const qualityStocks = parseInt(formData.qualityStocks, 10);
    
        const newInventoryItem = { 
            item_description: formData.itemDescription,
            unit_price: unitPrice, 
            quality_stocks: qualityStocks, 
            unit_measurement: formData.unitMeasurement
        };
        
        // Update the inventory in the backend
        const requestUrl = `http://localhost:5000/api/inventory/${editId}`;
        fetch(requestUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newInventoryItem), // Use the new item object here
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update inventory');
            }
            return response.json();
        })
        .then(updatedInventoryItem => {
            // Update the inventory in inventoryData and filteredData
            const updatedInventory = inventoryData.map(inventory =>
                inventory.id === updatedInventoryItem.id ? updatedInventoryItem : inventory
            );
            setInventoryData(updatedInventory);
            setFilteredData(updatedInventory); // Also update filtered data
        
            // Reset the form
            setFormData({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
            setEditId(null);
            alert('Inventory updated successfully!');
        })
        .catch(err => {
            console.error('Error updating inventory:', err);
            alert('There was an error updating the inventory. Please try again.');
        });        
    };
    

    const handleEditinventory = (inventory) => {
        console.log(inventory);
        setFormData({
            itemDescription: inventory.item_description, // Match the key from the server
            unitPrice: inventory.unit_price,
            qualityStocks: inventory.quality_stocks,
            unitMeasurement: inventory.unit_measurement,
        });
        setEditId(inventory.id);
    };

    const handleDeleteinventory = (id) => {
        fetch(`http://localhost:5000/api/inventory/${id}`, { method: 'DELETE' })
        .then(() => {
            setInventoryData(inventoryData.filter(inventory => inventory.id !== id));
            setFilteredData(filteredData.filter(inventory => inventory.id !== id)); // Also update filtered data
        })
        .catch(err => console.error('Error deleting inventory:', err));
    };


    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Filter the inventory based on the new search term
        const lowercasedFilter = value.toLowerCase();
        const filtered = inventoryData.filter(inventory => 
            inventory.item_description.toLowerCase().includes(lowercasedFilter) // Match the key from the server
        );
        setFilteredData(filtered);
    };

    return (
        <div className="content">
            <div className="d-flex justify-content-between align-inventorys-center my-4">
                <h1>Inventory</h1>
                <div className="d-flex">
                    <input
                        type="text"
                        placeholder="Search inventorys"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="form-control mx-2"
                        style={{ width: '250px' }}
                    />
                    <button onClick={handleSearchChange} className="btn btn-primary mx-2">Search</button>
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
                    <button onClick={handleUpdateinventory} className="btn btn-primary d-inline-block mx-2">
                        Update
                    </button>
                ) : (
                    <button onClick={handleAddinventory} className="btn btn-primary d-inline-block mx-2">
                        Add
                    </button>)}
            </div>
            
            {isLoading ? (
                <p>Loading inventory...</p>
            ) : (
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
                    {filteredData.map(inventory => ( // Use filteredData here
                        <tr key={inventory.id}>
                            <td>{inventory.item_description}</td> {/* Update to match key */}
                            <td>{inventory.unit_price}</td>
                            <td>{inventory.quality_stocks}</td>
                            <td>{inventory.unit_measurement}</td>
                            <td>
                                <button className="btn btn-warning btn-sm mx-1" onClick={() => handleEditinventory(inventory)}>Edit</button>
                                <button className="btn btn-danger btn-sm mx-1" onClick={() => handleDeleteinventory(inventory.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default InventoryTable;
