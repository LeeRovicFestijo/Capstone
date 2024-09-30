import React, { useState, useEffect } from 'react';
import './InventoryTable.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSearch, faEdit, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button } from 'react-bootstrap';
import { debounce } from 'lodash';

const InventoryTable = () => {
    const [inventoryData, setInventoryData] = useState([]);
    const [formData, setFormData] = useState({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const result = await axios.get('http://localhost:5000/api/inventory');
            setInventoryData(result.data);
            setFilteredData(result.data);
            setTotalItems(result.data.length);
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
                setTotalItems(updatedInventory.length);
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
                const updatedInventory = inventoryData.filter(item => item.id !== id);
                setInventoryData(updatedInventory);
                setFilteredData(updatedInventory);
                setTotalItems(updatedInventory.length);
            })
            .catch(err => console.error('Error deleting inventory:', err));
    };

    const handleDeleteSelected = async () => {
        const deletePromises = selectedItems.map(id =>
            fetch(`http://localhost:5000/api/inventory/${id}`, { method: 'DELETE' })
                .then(() => id)
                .catch(err => {
                    console.error(`Error deleting inventory with id ${id}:`, err);
                    return null;
                })
        );

        const deletedIds = await Promise.all(deletePromises);
        const updatedInventory = inventoryData.filter(item => !deletedIds.includes(item.id));

        setInventoryData(updatedInventory);
        setFilteredData(updatedInventory);
        setTotalItems(updatedInventory.length);
        setSelectedItems([]);
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
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredData.map(item => item.id));
        }
    };

    const resetForm = () => {
        setFormData({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
        setEditId(null);
    };

    const handleSearchChange = debounce((value) => {
        setSearchTerm(value);
        const lowercasedFilter = value.toLowerCase();
        const filtered = inventoryData.filter(inventory =>
            inventory.item_description.toLowerCase().includes(lowercasedFilter)
        );
        setFilteredData(filtered);
        setCurrentPage(1);
    }, 300);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <div className="inventory-table-container poppins-font">
            <div className="d-flex justify-content-between align-items-center my-4">
                <h1>Inventory</h1>
                <div className="d-flex position-relative">
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        defaultValue={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="search-bar form-control mx-2"
                        style={{ paddingRight: '2.5rem' }}
                    />
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="position-absolute"
                        style={{ right: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}
                    />
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

            <div className="d-flex justify-content-end my-2">
                <p>Total Items: {totalItems}</p>
            </div>

            {isLoading ? (
                <p>Loading inventory...</p>
            ) : currentItems.length === 0 ? (
                <p>No results found</p>
            ) : (
                <table className="table table-bordered inventory-table">
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
                        {currentItems.map(inventory => (
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
                                    <button
                                        onClick={() => handleEditInventory(inventory)}
                                        className="btn btn-sm btn-warning"
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteInventory(inventory.id)}
                                        className="btn btn-sm btn-danger mx-2"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="d-flex justify-content-between align-items-center">
                <button
                    className="btn btn-outline-primary"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    className="btn btn-outline-primary"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editId ? 'Edit Inventory' : 'Add Inventory'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group">
                        <label>Item Description</label>
                        <input
                            type="text"
                            className="form-control"
                            name="itemDescription"
                            value={formData.itemDescription}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Unit Price</label>
                        <input
                            type="number"
                            className="form-control"
                            name="unitPrice"
                            value={formData.unitPrice}
                            onChange={handleInputChange}
                    />
                    </div>
                    <div className="form-group">
                        <label>Quality in Stocks</label>
                        <input
                            type="number"
                            className="form-control"
                            name="qualityStocks"
                            value={formData.qualityStocks}
                            onChange={handleInputChange}
                    />
                    </div>
                    <div className="form-group">
                        <label>Unit of Measurement</label>
                        <div className="input-group">
                            <select
                                className="form-select"
                                name="unitMeasurement"
                                value={formData.unitMeasurement}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Unit</option>
                                <option value="bags">Bags</option>
                                <option value="pcs">Pcs</option>
                                <option value="boxes">Boxes</option>
                                <option value="pairs">Pairs</option>
                                <option value="roll">Roll</option>
                                <option value="pd">Pd</option>
                                <option value="gals">Gals</option>
                            </select>
                        </div>
                    </div>
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
