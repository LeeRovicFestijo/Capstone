import React, { useEffect, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import axios from 'axios';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { format } from 'date-fns';
import BarChart from '../graphs/BarChart';
import PieChart from '../graphs/PieChart';
import LineChart from '../graphs/LineChart';
import StatBox from '../graphs/StatBox';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import GroupsIcon from '@mui/icons-material/Groups';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import RestockTable from '../tables/RestockTable';
import { useInventory } from '../api/InventoryProvider';

const Dashboard = () => {
    const [totalSales, setTotalSales] = useState({});
    const [totalCustomer, setTotalCustomer] = useState([]);
    const [orderToShip, setOrderToShip] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const { restockData } = useInventory();
    
    const isMobile = useMediaQuery('(max-width: 768px)'); 
    const fetchTotalSales = async () => {
        try {
            const response = await axios.get('https://adminserver.sigbuilders.app/api/total-sales-dashboard');
            if (response.status === 200) {
                setTotalSales(response.data);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const fetchOrderToShip = async () => {
        try {
            const response = await axios.get('https://adminserver.sigbuilders.app/api/active-shipments-dashboard');
            if (response.status === 200) {
                setOrderToShip(response.data);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const fetchTotalCustomer = async () => {
        try {
            const response = await axios.get('https://adminserver.sigbuilders.app/api/total-customer-dashboard');
            if (response.status === 200) {
                setTotalCustomer(response.data);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const fetchRecentOrders = async () => {
        try {
            const response = await axios.get('https://adminserver.sigbuilders.app/api/recent-orders-dashboard');
            if (response.status === 200) {
                setRecentOrders(response.data);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        fetchTotalSales();
        fetchTotalCustomer();
        fetchOrderToShip();
        fetchRecentOrders();
    }, []);

    return (
        <MainLayout>
            <div className="dashboard mt-3">
                <Box
                    display="grid"
                    gridTemplateColumns={isMobile ? 'repeat(1, 1fr)' : 'repeat(12, 1fr)'} // Adjust grid based on screen size
                    gridAutoRows="140px"
                    gap="20px"
                >
                    {/* Total Sales */}
                    <Box
                        gridColumn={isMobile ? 'span 12' : 'span 3'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            backgroundColor: '#143024',
                            padding: '16px',
                            borderRadius: '8px',
                        }}
                    >
                        <StatBox
                            title="Total Sales"
                            subtitle={totalSales.total_sales ? totalSales.total_sales : '0'}
                            icon={<PointOfSaleIcon sx={{ fontSize: '3rem', color: '#ddbb68' }} />}
                        />
                    </Box>

                    {/* Total Customers */}
                    <Box
                        gridColumn={isMobile ? 'span 12' : 'span 3'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            backgroundColor: '#143024',
                            padding: '16px',
                            borderRadius: '8px',
                        }}
                    >
                        <StatBox
                            title="Total Customers"
                            subtitle={totalCustomer.totalCustomers ? totalCustomer.totalCustomers : '0'}
                            icon={<GroupsIcon sx={{ fontSize: '3rem', color: '#ddbb68' }} />}
                        />
                    </Box>

                    {/* Orders to Ship */}
                    <Box
                        gridColumn={isMobile ? 'span 12' : 'span 3'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            backgroundColor: '#143024',
                            padding: '16px',
                            borderRadius: '8px',
                        }}
                    >
                        <StatBox
                            title="Orders to Ship"
                            subtitle={orderToShip.activeShipments ? orderToShip.activeShipments : '0'}
                            icon={<LocalShippingIcon sx={{ fontSize: '3rem', color: '#ddbb68' }} />}
                        />
                    </Box>

                    {/* Restock Items */}
                    <Box
                        gridColumn={isMobile ? 'span 12' : 'span 3'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            backgroundColor: '#143024',
                            padding: '16px',
                            borderRadius: '8px',
                        }}
                    >
                        <StatBox
                            title="Restock Items"
                            subtitle={restockData.length ? restockData.length : '0'}
                            icon={<ReportProblemIcon sx={{ fontSize: '3rem', color: '#ddbb68' }} />}
                        />
                    </Box>

                    {/* Monthly Sales Chart */}
                    <Box
                        gridColumn={isMobile ? 'span 12' : 'span 8'}
                        gridRow="span 2"
                        sx={{
                            backgroundColor: '#143024',
                            padding: '16px',
                            borderRadius: '8px',
                        }}
                    >
                        <Box
                            mt="25px"
                            p="0 30px"
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography variant="h5" fontWeight="600" color="#ddbb68">
                                Monthly Sales
                            </Typography>
                        </Box>
                        <Box height="250px" ml="-20px">
                            <LineChart />
                        </Box>
                    </Box>

                    {/* Recent Transactions */}
                    <Box
                        gridColumn={isMobile ? 'span 12' : 'span 4'}
                        gridRow="span 2"
                        overflow="auto"
                        sx={{
                            backgroundColor: '#143024',
                            padding: '16px',
                            borderRadius: '8px',
                        }}
                    >
                        <Box display="flex" justifyContent="space-between" alignItems="center" p="15px">
                            <Typography variant="h5" fontWeight="600" color="#ddbb68">
                                Recent Transactions
                            </Typography>
                        </Box>
                        {recentOrders.map((transaction) => (
                            <Box
                                key={transaction.order_id}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                p="15px"
                                sx={{
                                    backgroundColor: '#143024',
                                    padding: '16px',
                                    borderRadius: '8px',
                                }}
                            >
                                <Typography variant="h5" fontWeight="600" color="white">
                                    {transaction.order_id}
                                </Typography>
                                <Typography color="white">
                                    {format(new Date(transaction.order_date), 'MM/dd/yyyy')}
                                </Typography>
                                <Typography color="white">₱{transaction.total_amount}</Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Monthly Top Items Chart */}
                    <Box
                        gridColumn={isMobile ? 'span 12' : 'span 5'}
                        gridRow="span 2"
                        sx={{
                            backgroundColor: '#143024',
                            padding: '16px',
                            borderRadius: '8px',
                        }}
                    >
                        <Box
                            mt="25px"
                            p="0 30px"
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography variant="h5" fontWeight="600" color="#ddbb68">
                                Monthly Top Items
                            </Typography>
                        </Box>
                        <Box height="250px" ml="-20px">
                            <BarChart />
                        </Box>
                    </Box>

                    {/* Payment Sales Pie Chart */}
                    <Box
                        gridColumn={isMobile ? 'span 12' : 'span 3'}
                        gridRow="span 2"
                        sx={{
                            backgroundColor: '#143024',
                            padding: '16px',
                            borderRadius: '8px',
                        }}
                    >
                        <Box
                            mt="25px"
                            p="0 30px"
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography variant="h5" fontWeight="600" color="#ddbb68">
                                Payment Sales
                            </Typography>
                        </Box>
                        <Box height="250px" ml="-20px">
                            <PieChart />
                        </Box>
                    </Box>

                    {/* Restock Table */}
                    <Box
                        gridColumn={isMobile ? 'span 12' : 'span 4'}
                        gridRow="span 2"
                        overflow="auto"
                        sx={{
                            backgroundColor: '#143024',
                            padding: '16px',
                            borderRadius: '8px',
                        }}
                    >
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            p="15px"
                        >
                            <Typography variant='h5' fontWeight={"600"} color="#ddbb68" sx={{ fontFamily: 'Poppins' }}>
                                Items to Restock
                            </Typography>
                        </Box>
                        <Box>
                            <RestockTable />
                        </Box>
                    </Box>
                </Box>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
