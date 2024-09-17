import React, { useState } from 'react';
import './InventoryTable.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const InventoryTable = () => {
    const initialInventory = [
    ];

    const [inventoryData, setInventoryData] = useState(initialInventory);
    const [formData, setFormData] = useState({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleAddItem = () => {
        if (!formData.itemDescription || !formData.unitPrice || !formData.qualityStocks || !formData.unitMeasurement) {
            alert('Please fill in all fields.');
            return;
        }

        const calculatedTotalCost = (formData.unitPrice * formData.qualityStocks).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });

        if (editId) {
            setInventoryData(inventoryData.map(item => (item.id === editId ? { ...item, ...formData, totalCost: calculatedTotalCost } : item)));
            setEditId(null);
        } else {
            const newItem = { id: Date.now(), ...formData, totalCost: calculatedTotalCost };
            setInventoryData([...inventoryData, newItem]);
        }

        setFormData({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
    };

    const handleEditItem = (item) => {
        setFormData({
            itemDescription: item.itemDescription,
            unitPrice: item.unitPrice,
            qualityStocks: item.qualityStocks,
            unitMeasurement: item.unitMeasurement,
        });
        setEditId(item.id);
    };

    const handleDeleteItem = (id) => {
        setInventoryData(inventoryData.filter(item => item.id !== id));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearch = () => {
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
                            <td>{item.itemDescription}</td>
                            <td>{item.unitPrice}</td>
                            <td>{item.qualityStocks}</td>
                            <td>{item.unitMeasurement}</td>
                            <td>{item.totalCost}</td>
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