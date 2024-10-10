import React, { useState, useEffect } from 'react';
import '../components/InventoryTable.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSearch, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import { Modal, Button } from 'react-bootstrap';
import { debounce } from 'lodash';
import { toast, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from '../layout/MainLayout';
import { useInventory } from '../api/InventoryProvider';

const InventoryTable = () => {
    const { inventoryData, setInventoryData } = useInventory();
    const [formData, setFormData] = useState({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
    const [formFile, setFormFile] = useState(null); // File state for image upload
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteMode, setDeleteMode] = useState('');
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const result = await axios.get('http://localhost:5001/api/inventory');
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

    const toastOptions = {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Flip,
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormFile(e.target.files[0]); // Handle the image file selection
    };

    const handleAddInventory = () => {
        if (!formData.itemDescription || !formData.unitPrice || !formData.qualityStocks || !formData.unitMeasurement) {
            toast.error('Please fill in all fields!', toastOptions)
            return;
        }

        const newInventoryData = {
            item_description: formData.itemDescription,
            unit_price: parseFloat(formData.unitPrice),
            quality_stocks: parseInt(formData.qualityStocks, 10),
            unit_measurement: formData.unitMeasurement,
        };

        console.log(editId);
        console.log(formData);

        const requestUrl = editId ? `http://localhost:5001/api/inventory/${editId}` : 'http://localhost:5001/api/inventory';
        const method = editId ? 'PUT' : 'POST';

        const formDataToSubmit = new FormData();
        formDataToSubmit.append('item_description', newInventoryData.item_description);
        formDataToSubmit.append('unit_price', newInventoryData.unit_price);
        formDataToSubmit.append('quality_stocks', newInventoryData.quality_stocks);
        formDataToSubmit.append('unit_measurement', newInventoryData.unit_measurement);

        if (formFile) {
            formDataToSubmit.append('item_image', formFile);
        }

        console.log(formDataToSubmit);

        fetch(requestUrl, {
            method: method,
            body: formDataToSubmit,
        })
            .then(response => {
                console.log('Inventory updated:', response);
                fetchInventory();
            })
            toast.success('Inventory saved successfully!', toastOptions)
            setShowModal(false);
    };

    const handleEditInventory = (inventory) => {
        setFormData({
            itemDescription: inventory.item_description,
            unitPrice: inventory.unit_price,
            qualityStocks: inventory.quality_stocks,
            unitMeasurement: inventory.unit_measurement,
        });
        setEditId(inventory.item_id);
        setShowModal(true);
    };

    const handleDeleteInventory = async (id) => {
        try {
            await fetch(`http://localhost:5001/api/inventory/${id}`, { method: 'DELETE' });
            fetchInventory();
            setItemToDelete(null);
            toast.success('Item deleted successfully!', toastOptions)
        } catch (err) {
            console.error('Error deleting inventory:', err);
        }
    };

    const handleDeleteSelected = async () => {
        const deletePromises = selectedItems.map(id =>
            fetch(`http://localhost:5001/api/inventory/${id}`, { method: 'DELETE' })
                .then(() => id)
                .catch(err => {
                    console.error(`Error deleting inventory with id ${id}:`, err);
                    return null;
                })
        );

        const deletedIds = await Promise.all(deletePromises);
        fetchInventory();
        setSelectedItems([]);
        toast.success('Selected Items deleted successfully!', toastOptions)
    };

    const confirmDeleteItem = (id) => {
        setItemToDelete(id);
        setDeleteMode('single');
        setShowDeleteModal(true);
    };

    const confirmDeleteSelected = () => {
        setDeleteMode('multiple');
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (deleteMode === 'single' && itemToDelete) {
            handleDeleteInventory(itemToDelete);
        } else if (deleteMode === 'multiple') {
            handleDeleteSelected();
        }
        setShowDeleteModal(false);
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
            setSelectedItems(filteredData.map(item => item.item_id));
        }
    };

    const resetForm = () => {
        setFormData({ itemDescription: '', unitPrice: '', qualityStocks: '', unitMeasurement: '' });
        setFormFile(null);
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
        <MainLayout>
            <div className='row'>
                <div className="inventory-table-container p-3 poppins-font">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2>Inventory</h2>
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
                    <hr />

                    <div className="d-flex my-2">
                        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary">
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Add Inventory
                        </button>
                        {selectedItems.length > 0 && (
                            <button className="btn btn-danger mx-2" onClick={confirmDeleteSelected}>
                                <FontAwesomeIcon icon={faTrash} className="me-2" />
                                Delete Selected
                            </button>
                        )}
                    </div>

                    <Paper>
                        <Table>
                        <TableHead>
                            <TableRow>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <input
                                type="checkbox"
                                checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                                onChange={handleSelectAll}
                            />
                            </TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Item Description</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Unit Price</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Quality Stocks</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Unit Measurement</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Image</TableCell>
                            <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentItems.map((inventory) => (
                            <TableRow 
                                key={inventory.item_id} 
                                style={{cursor:'pointer'}} 
                            >
                                <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(inventory.item_id)}
                                        onChange={() => handleSelectItem(inventory.item_id)}
                                    />
                                </TableCell>
                                <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{inventory.item_description}</TableCell>
                                <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{inventory.unit_price}</TableCell>
                                <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{inventory.quality_stocks}</TableCell>
                                <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>{inventory.unit_measurement}</TableCell>
                                <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {inventory.item_image ? (
                                        <img src={inventory.item_image} alt="item" style={{ width: '50px', height: '50px' }} />
                                        ) : (
                                        <span>No image</span>
                                    )}
                                </TableCell>
                                <TableCell style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    <button className="edit-btn mx-1" onClick={() => handleEditInventory(inventory)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button className="delete-btn mx-1" onClick={() => confirmDeleteItem(inventory.item_id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </Paper>

                    {isLoading && <p>Loading...</p>}
                    {!isLoading && filteredData.length === 0 && <p>No inventory found.</p>}

                    <div className="pagination">
                        <button
                            className="pagination-btn"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="pagination-info">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="pagination-btn"
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
                                <label htmlFor="itemDescription">Item Description</label>
                                <input
                                    type="text"
                                    id="itemDescription"
                                    name="itemDescription"
                                    value={formData.itemDescription}
                                    onChange={handleInputChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="unitPrice">Unit Price</label>
                                <input
                                    type="number"
                                    id="unitPrice"
                                    name="unitPrice"
                                    value={formData.unitPrice}
                                    onChange={handleInputChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="qualityStocks">Quality Stocks</label>
                                <input
                                    type="number"
                                    id="qualityStocks"
                                    name="qualityStocks"
                                    value={formData.qualityStocks}
                                    onChange={handleInputChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="unitMeasurement">Unit Measurement</label>
                                <input
                                    type="text"
                                    id="unitMeasurement"
                                    name="unitMeasurement"
                                    value={formData.unitMeasurement}
                                    onChange={handleInputChange}
                                    className="form-control"
                                />
                                
                            </div>
                            <div className="form-group">
                                <label htmlFor="item_image">Image</label>
                                <input
                                    type="file"
                                    id="item_image"
                                    name="item_image"
                                    onChange={handleFileChange}
                                    className="form-control"
                                />
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowModal(false)}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={handleAddInventory}>
                                {editId ? 'Update Inventory' : 'Add Inventory'}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Delete</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Are you sure you want to delete {deleteMode === 'single' ? 'this item' : 'the selected items'}?
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleConfirmDelete}>
                                Confirm
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
    </MainLayout>
    );
};

export default InventoryTable;
