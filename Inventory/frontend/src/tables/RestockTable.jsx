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
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Typography variant="h7" fontWeight="600">Item Description</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="h7" fontWeight="600">Quality Stocks</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="h7" fontWeight="600">Reorder Point</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="h7" fontWeight="600">Recommended Order Stocks</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="h7" fontWeight="600">ABC Classification</Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {restockData.map((stock) => (
                        <TableRow key={stock.item_id}>
                            <TableCell>
                                <Typography variant="body1">{stock.item_description}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body1">{stock.quality_stocks}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body1">{stock.reorder_point}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body1">{stock.eoq}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body1">{stock.abc_classification}</Typography>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default RestockTable;
