import React, { useState, useEffect } from 'react';
import './InventoryTable.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSearch, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button } from 'react-bootstrap';

const InventoryTable = () => {
    const [inventoryData, setInventoryData] = useState([]);
    const [formData, setFormData] = useState({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]); // State for selected items

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
                setShowModal(false);
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
        setShowModal(true);
    };

    const handleDeleteInventory = (id) => {
        fetch(`http://localhost:5000/api/inventory/${id}`, { method: 'DELETE' })
            .then(() => {
                setInventoryData(inventoryData.filter(item => item.id !== id));
                setFilteredData(filteredData.filter(item => item.id !== id));
            })
            .catch(err => console.error('Error deleting inventory:', err));
    };

    const handleDeleteSelected = () => {
        selectedItems.forEach(id => handleDeleteInventory(id));
        setSelectedItems([]); // Reset selected items after deletion
    };

    const handleSelectItem = (id) => {
        setSelectedItems(prevSelectedItems =>
            prevSelectedItems.includes(id)
                ? prevSelectedItems.filter(item => item !== id)
                : [...prevSelectedItems, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedItems.length === filteredData.length) {
            setSelectedItems([]); // Deselect all
        } else {
            setSelectedItems(filteredData.map(item => item.id)); // Select all
        }
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

            <div className="d-flex my-2">
                <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary">
                    <FontAwesomeIcon icon={faPlus} /> Add Inventory
                </button>

                <button
                    onClick={handleDeleteSelected}
                    className="btn btn-danger ms-2"
                    disabled={selectedItems.length === 0}
                >
                    <FontAwesomeIcon icon={faTrash} /> Delete Selected
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
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </th>
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
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(inventory.id)}
                                        onChange={() => handleSelectItem(inventory.id)}
                                    />
                                </td>
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

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editId ? 'Edit Inventory' : 'Add Inventory'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input
                        type="text"
                        name="itemDescription"
                        placeholder="Item Description"
                        value={formData.itemDescription}
                        onChange={handleInputChange}
                        className="form-control my-2"
                    />
                    <input
                        type="number"
                        name="unitPrice"
                        placeholder="Unit Price"
                        value={formData.unitPrice}
                        onChange={handleInputChange}
                        className="form-control my-2"
                    />
                    <input
                        type="number"
                        name="qualityStocks"
                        placeholder="Quality in Stocks"
                        value={formData.qualityStocks}
                        onChange={handleInputChange}
                        className="form-control my-2"
                    />
                    <input
                        type="text"
                        name="unitMeasurement"
                        placeholder="Measurement"
                        value={formData.unitMeasurement}
                        onChange={handleInputChange}
                        className="form-control my-2"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleAddInventory}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default InventoryTable;
