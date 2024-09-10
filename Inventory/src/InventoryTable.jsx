import React, { useState } from 'react';
import './InventoryTable.css';

const InventoryTable = () => {
    const initialInventory = [
        { id: 1, itemDescription: 'Holcim Excel', unitPrice: 186, qualityStocks: 860, unitMeasurement: 'bags', totalCost: '₱159,960.00' },
        { id: 2, itemDescription: 'G.I. Pipe 2 1/2 LS II', unitPrice: 3, qualityStocks: 120, unitMeasurement: 'pcs', totalCost: '₱360.00' },
        { id: 3, itemDescription: 'G.I. Pipe 2 LS II', unitPrice: 1215, qualityStocks: 200, unitMeasurement: 'pcs', totalCost: '₱243,000.00' },
    ];

    const [inventoryData, setInventoryData] = useState(initialInventory);
    const [formData, setFormData] = useState({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '', totalCost: '' });
    const [editId, setEditId] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleAddItem = () => {
        const calculatedTotalCost = (formData.unitPrice * formData.qualityStocks).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });

        if (editId) {
            setInventoryData(inventoryData.map(item => (item.id === editId ? { ...item, ...formData, totalCost: calculatedTotalCost } : item)));
            setEditId(null);
        } else {
            const newItem = { id: Date.now(), ...formData, totalCost: calculatedTotalCost };
            setInventoryData([...inventoryData, newItem]);
        }

        setFormData({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '', totalCost: '' });
    };

    const handleEditItem = (item) => {
        setFormData(item);
        setEditId(item.id);
    };

    const handleDeleteItem = (id) => {
        setInventoryData(inventoryData.filter(item => item.id !== id));
    };

    return (
        <div className="content">
            <div className="inventory-header">
                <h1>Inventory</h1>
                <div className="controls">
                    <input
                        type="text"
                        name="itemDescription"
                        placeholder="Item Description"
                        value={formData.itemDescription}
                        onChange={handleInputChange}
                    />
                    <input
                        type="number"
                        name="unitPrice"
                        placeholder="Unit Price"
                        value={formData.unitPrice}
                        onChange={handleInputChange}
                    />
                    <input
                        type="number"
                        name="qualityStocks"
                        placeholder="Quality in Stocks"
                        value={formData.qualityStocks}
                        onChange={handleInputChange}
                    />
                    <input
                        type="text"
                        name="unitMeasurement"
                        placeholder="Unit of Measurement"
                        value={formData.unitMeasurement}
                        onChange={handleInputChange}
                    />
                    <button onClick={handleAddItem}>{editId ? 'Update' : 'Add'}</button>
                </div>
            </div>
            <table>
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
                                <button onClick={() => handleEditItem(item)}>Edit</button>
                                <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryTable;
