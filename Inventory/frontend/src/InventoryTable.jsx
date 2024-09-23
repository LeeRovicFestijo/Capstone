import React, { useState, useEffect } from 'react';
import './InventoryTable.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSearch, faEdit } from '@fortawesome/free-solid-svg-icons'; // Import the edit icon

const InventoryTable = () => {
    const [inventoryData, setInventoryData] = useState([]);
    const [formData, setFormData] = useState({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const result = await axios.get('http://localhost:5000/api/inventory'); 
            setInventoryData(result.data); 
            setFilteredData(result.data);
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
        setFormData({ ...formData, [name]: value });
    };

    const handleAddInventory = () => {
        if (!formData.itemDescription || !formData.unitPrice || !formData.qualityStocks || !formData.unitMeasurement) {
            alert('Please fill in all fields.');
            return;
        }

        const newInventoryData = { 
            item_description: formData.itemDescription,
            unit_price: parseFloat(formData.unitPrice), 
            quality_stocks: parseInt(formData.qualityStocks, 10), 
            unit_measurement: formData.unitMeasurement
        };

        const requestUrl = editId ? `http://localhost:5000/api/inventory/${editId}` : 'http://localhost:5000/api/inventory';
        const method = editId ? 'PUT' : 'POST';

        fetch(requestUrl, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newInventoryData),
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to save inventory');
            return response.json();
        })
        .then(savedInventory => {
            const updatedInventory = editId 
                ? inventoryData.map(item => (item.id === savedInventory.id ? savedInventory : item))
                : [...inventoryData, savedInventory];
            setInventoryData(updatedInventory);
            setFilteredData(updatedInventory);
            resetForm();
            alert('Inventory saved successfully!');
        })
        .catch(err => {
            console.error('Error saving inventory:', err);
            alert('Error saving inventory. Please try again.');
        });
    };

    const handleEditInventory = (inventory) => {
        setFormData({
            itemDescription: inventory.item_description,
            unitPrice: inventory.unit_price,
            qualityStocks: inventory.quality_stocks,
            unitMeasurement: inventory.unit_measurement,
        });
        setEditId(inventory.id);
    };

    const handleDeleteInventory = (id) => {
        fetch(`http://localhost:5000/api/inventory/${id}`, { method: 'DELETE' })
        .then(() => {
            setInventoryData(inventoryData.filter(item => item.id !== id));
            setFilteredData(filteredData.filter(item => item.id !== id));
        })
        .catch(err => console.error('Error deleting inventory:', err));
    };

    const resetForm = () => {
        setFormData({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
        setEditId(null);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        const lowercasedFilter = value.toLowerCase();
        const filtered = inventoryData.filter(inventory => 
            inventory.item_description.toLowerCase().includes(lowercasedFilter)
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
                        placeholder="Search inventory..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-bar form-control mx-2"
                    />
                    <button className="btn btn-primary">
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
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
                <button onClick={handleAddInventory} className="btn btn-primary d-inline-block mx-2">
                    <FontAwesomeIcon icon={faPlus} /> Add
                </button>
            </div>

            {isLoading ? (
    <p>Loading inventory...</p>
) : filteredData.length === 0 ? (
    <p>No results found</p>
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
        {filteredData.map(inventory => (
            <tr key={inventory.id}>
                <td>{inventory.item_description}</td>
                <td>{inventory.unit_price}</td>
                <td>{inventory.quality_stocks}</td>
                <td>{inventory.unit_measurement}</td>
                <td>
                    <button className="btn btn-warning btn-sm mx-1" onClick={() => handleEditInventory(inventory)}>
                        <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                    <button className="btn btn-danger btn-sm mx-1" onClick={() => handleDeleteInventory(inventory.id)}>
                        <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
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