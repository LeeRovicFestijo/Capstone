import React, { useState, useEffect } from 'react';
import '../components/InventoryTable.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Menu, MenuItem } from '@mui/material';
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
    const [filterOption, setFilterOption] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null); 
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const result = await axios.get('https://adminserver.sigbuilders.app/api/inventory');
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

    useEffect(() => {
        applyFilter();
    }, [filterOption, searchTerm, inventoryData]);


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
        setFormFile(e.target.files[0]); 
    };

    const handleOpenClick = (event) => {
        setAnchorEl(event.currentTarget); 
    };

    const handleFilterClick = (option) => {
        setFilterOption(option); 
    };

    const applyFilter = () => {
        let filtered = [...inventoryData];

        // Apply search filter first
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.item_description.toLowerCase().includes(lowercasedFilter)
            );
        }

        // Apply filter based on selected option
        switch (filterOption) {
            case 'a-z':
                filtered.sort((a, b) => a.item_description.localeCompare(b.item_description));
                break;
            case 'z-a':
                filtered.sort((a, b) => b.item_description.localeCompare(a.item_description));
                break;
            case 'oldest':
                filtered.sort((a, b) => a.item_id - b.item_id); 
                break;
            case 'newest':
                filtered.sort((a, b) => b.item_id - a.item_id); 
                break;
            case 'bags':
            case 'gals':
            case 'pcs':
            case 'pairs':
            case 'roll':
                filtered = filtered.filter(item => item.unit_measurement === filterOption);
                break;
            default:
                break;
        }

        setFilteredData(filtered);
    };

    const handleCloseDropdown = () => {
        setAnchorEl(null);
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

        const requestUrl = editId ? `https://adminserver.sigbuilders.app/api/inventory/${editId}` : 'https://adminserver.sigbuilders.app/api/inventory';
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
                    <div className="row justify-content-between align-items-center">
                        <div className="header-title col-md-6 col-sm-12">
                            <h2 style={{ fontWeight: '600' }}>Inventory</h2>
                        </div>
                        <div className="header-search col-md-6 col-sm-12 d-flex justify-content-end">
                            <div className="search-bar-container">
                                <input
                                    type="text"
                                    placeholder="Search inventory..."
                                    defaultValue={searchTerm}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="search-bar form-control"
                                />
                            </div>
                        </div>
                    </div>
                    <hr />

                    <div className="d-flex my-2 justify-content-between align-items-center flex-wrap">
                        <div className="d-flex">
                            <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-success">
                                <FontAwesomeIcon icon={faPlus} className="me-2" />
                                Add Inventory
                            </button>
                        </div>
                        <button className='btn btn-success ms-auto mt-2 mt-sm-0' onClick={handleOpenClick}>
                            <i className='bi bi-funnel'/> Filter
                        </button>
                    </div>

                    <Paper className="table-responsive">
                        <Table>
                        <TableHead>
                            <TableRow>
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
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </Paper>

                    {isLoading && <p>Loading...</p>}
                    {!isLoading && filteredData.length === 0 && <p>No inventory found.</p>}

                    <div className="pagination d-flex flex-column flex-sm-row justify-content-between align-items-center">
                        <button
                            className="pagination-btn mb-2 mb-sm-0"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <div className="pagination-info mb-2 mb-sm-0 text-center">
                            Page {currentPage} of {totalPages}
                        </div>
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
                            <Button variant="success" onClick={handleAddInventory}>
                                {editId ? 'Update Inventory' : 'Add Inventory'}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleCloseDropdown}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                    >
                        <MenuItem onClick={() => handleFilterClick("")}>All</MenuItem>
                        <MenuItem onClick={() => handleFilterClick("a-z")}>A-Z</MenuItem>
                        <MenuItem onClick={() => handleFilterClick("z-a")}>Z-A</MenuItem>
                        <MenuItem onClick={() => handleFilterClick("oldest")}>Oldest</MenuItem>
                        <MenuItem onClick={() => handleFilterClick("newest")}>Newest</MenuItem>
                        <MenuItem onClick={() => handleFilterClick("bags")}>Bags</MenuItem>
                        <MenuItem onClick={() => handleFilterClick("gals")}>Gals</MenuItem>
                        <MenuItem onClick={() => handleFilterClick("pcs")}>Pcs</MenuItem>
                        <MenuItem onClick={() => handleFilterClick("pairs")}>Pairs</MenuItem>
                        <MenuItem onClick={() => handleFilterClick("roll")}>Roll</MenuItem>
                    </Menu>
                </div>
            </div>
    </MainLayout>
    );
};

export default InventoryTable;
