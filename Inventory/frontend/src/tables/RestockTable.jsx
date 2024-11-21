import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from '@mui/material';
import { useInventory } from '../api/InventoryProvider';

const RestockTable = () => {
    const { restockData, setRestockData } = useInventory();
    const [loading, setLoading] = useState(true);

    const fetchRestockData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://adminserver.sigbuilders.app/api/restock-dashboard');
            if (response.status === 200) {
                setRestockData(response.data);
            }
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestockData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!Array.isArray(restockData) || restockData.length === 0) {
        return <div>No data available</div>; 
    }

    return (
        <TableContainer
            component={Paper}
            sx={{
                backgroundColor: '#143024', // Green background for the table
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                overflow: 'auto',
            }}
        >
            <Table>
                {/* Table Header */}
                <TableHead>
                    <TableRow>
                        {['Item Description', 'Quality Stocks', 'Reorder Point', 'Recommended Order Stocks', 'ABC Classification'].map((header) => (
                            <TableCell
                                key={header}
                                sx={{
                                    color: '#ddbb68', // Header color
                                    fontWeight: '600',
                                    backgroundColor: '#143024',
                                    borderBottom: '2px solid #ddbb68',
                                }}
                            >
                                <Typography variant="h7">{header}</Typography>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                {/* Table Body */}
                <TableBody>
                    {restockData.map((stock) => (
                        <TableRow key={stock.item_id}>
                            <TableCell>
                                <Typography variant="body1" sx={{ color: 'white' }}>{stock.item_description}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body1" sx={{ color: 'white' }}>{stock.quality_stocks}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body1" sx={{ color: 'white' }}>{stock.reorder_point}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body1" sx={{ color: 'white' }}>{stock.eoq}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body1" sx={{ color: 'white' }}>{stock.abc_classification}</Typography>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default RestockTable;
