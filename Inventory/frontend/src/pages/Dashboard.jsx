import React, { useEffect, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import axios from 'axios';
import { Box, Typography, useMediaQuery, FormControl, Select, MenuItem, Switch } from '@mui/material';
import { format } from 'date-fns';
import BarChart from '../graphs/BarChart';
import PieChart from '../graphs/PieChart';
import LineChart from '../graphs/LineChart';
import StatBox from '../graphs/StatBox';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import GroupsIcon from '@mui/icons-material/Groups';
import InventoryIcon from '@mui/icons-material/Inventory';
import RestockTable from '../tables/RestockTable';
import { useInventory } from '../api/InventoryProvider';

const Dashboard = () => {
    const [totalSales, setTotalSales] = useState({});
    const [compareMode, setCompareMode] = useState(false);
    const [totalCustomer, setTotalCustomer] = useState([]);
    const [orderToShip, setOrderToShip] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const { restockData, inventoryData, setInventoryData, years, setYears } = useInventory();

    const [compareYear, setCompareYear] = useState(
        years.length > 0 ? years[years.length - 2] : ''
    );
    
    const isMobile = useMediaQuery('(max-width: 768px)');

    const fetchYears = async () => {
        try {
          const response = await axios.get("https://adminserver.sigbuilders.app/api/getYears"); 
          const data = response.data; 
          setYears(data.years); 
        } catch (error) {
          console.error("Error fetching years:", error);
        }
    };

    const [currentYear, setCurrentYear] = useState(
        years.length > 0 ? years[years.length - 1] : ''
    );

    const fetchTotalSales = async (currentYear) => {
        try {
            const response = await axios.get('https://adminserver.sigbuilders.app/api/total-sales-dashboard', {
                params: { year: currentYear } 
            });
            if (response.status === 200) {
                setTotalSales(response.data); 
            }
        } catch (error) {
            console.error(error.message);
        }

        // https://adminserver.sigbuilders.app
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

    const fetchInventory = async () => {
        try {
            const result = await axios.get('https://adminserver.sigbuilders.app/api/inventory');
            setInventoryData(result.data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        }
    };


    useEffect(() => {
        fetchYears();
        fetchInventory();
        fetchTotalSales(currentYear);
        fetchTotalCustomer();
        fetchOrderToShip();
        fetchRecentOrders();
    }, [currentYear]);

    useEffect(() => {
        if (years.length > 0 && (!currentYear || !years.includes(currentYear))) {
            setCurrentYear(years[years.length - 1]);
        }
    }, [years, currentYear]);

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
                            subtitle={totalSales.total_sales ? parseFloat(totalSales.total_sales).toLocaleString() : '0'}
                            icon={
                                <PointOfSaleIcon
                                    sx={{
                                        fontSize: {
                                            xs: '3rem',      // For mobile screens (max-width: 600px)
                                            sm: '2.5rem',    // For tablets (max-width: 960px)
                                            md: '3rem'       // For desktops (default)
                                        },
                                        color: '#ddbb68'
                                    }}
                                />
                            }
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
                            subtitle={totalCustomer.totalCustomers ? parseFloat(totalCustomer.totalCustomers).toLocaleString() : '0'}
                            icon={
                                <GroupsIcon
                                    sx={{
                                        fontSize: {
                                            xs: '3rem',      // For mobile screens (max-width: 600px)
                                            sm: '2.5rem',    // For tablets (max-width: 960px)
                                            md: '3rem'       // For desktops (default)
                                        },
                                        color: '#ddbb68'
                                    }}
                                />
                            }
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
                            subtitle={orderToShip.activeShipments ? parseFloat(orderToShip.activeShipments).toLocaleString() : '0'}
                            icon={
                                <LocalShippingIcon
                                    sx={{
                                        fontSize: {
                                            xs: '3rem',      // For mobile screens (max-width: 600px)
                                            sm: '2.5rem',    // For tablets (max-width: 960px)
                                            md: '3rem'       // For desktops (default)
                                        },
                                        color: '#ddbb68'
                                    }}
                                />
                            }
                        />
                    </Box>

                    {/* Total Products */}
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
                            title="Total Products"
                            subtitle={inventoryData.length ? inventoryData.length.toLocaleString() : '0'}
                            icon={
                                <InventoryIcon
                                    sx={{
                                        fontSize: {
                                            xs: '3rem',      // For mobile screens (max-width: 600px)
                                            sm: '2.5rem',    // For tablets (max-width: 960px)
                                            md: '3rem'       // For desktops (default)
                                        },
                                        color: '#ddbb68'
                                    }}
                                />
                            }
                        />
                    </Box>

                    {/* Monthly Sales Chart */}
                    <Box
                        gridColumn={compareMode && !isMobile ? 'span 6' : 'span 12'}
                        gridRow="span 2"
                        sx={{
                            backgroundColor: '#143024',
                            padding: '16px',
                            borderRadius: '8px',
                        }}
                    >
                        <Box
                            p="0 30px"
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography 
                                variant="h5" 
                                fontWeight="600" 
                                color="#ddbb68"
                                sx={{
                                    fontSize: isMobile ? '16px' : '20px',
                                }}
                            >
                                Monthly Sales
                            </Typography>
                            <Box display="flex" alignItems="center" sx={{ ml: 'auto' }}>
                                <Typography variant="body1" color="#ddbb68">
                                    Compare
                                </Typography>
                                <Switch
                                    checked={compareMode}
                                    onChange={(e) => setCompareMode(e.target.checked)}
                                    sx={{
                                        '.MuiSwitch-switchBase.Mui-checked': {
                                            color: '#ddbb68',
                                        },
                                        '.MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#ddbb68',
                                        },
                                    }}
                                />
                            </Box>
                            <FormControl 
                                sx={{
                                    minWidth: isMobile ? '3vw' : '5vw', 
                                    '.MuiSelect-root': {
                                        fontSize: isMobile ? '12px' : '16px',
                                    },
                                }}
                            >
                                <Select
                                    labelId="year-select-label"
                                    value={currentYear}
                                    onChange={(e) => setCurrentYear(e.target.value)}
                                    sx={{
                                        fontSize: isMobile ? '0.8rem' : '16px', // Smaller font size for mobile
                                        minWidth: isMobile ? '80px' : '100px', // Adjust width dynamically
                                        color: '#ddbb68', 
                                        '.MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#ddbb68', 
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#ddbb68', 
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#ddbb68',
                                        },
                                        '.MuiSvgIcon-root': {
                                            color: '#ddbb68', 
                                        },
                                    }}
                                >
                                    {years.map(year => (
                                        <MenuItem key={year} value={year}>{year}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box height="250px" ml="0px">
                            <LineChart filterYear={currentYear} />
                        </Box>
                    </Box>

                    {compareMode && (
                        <Box
                            gridColumn={compareMode && !isMobile ? 'span 6' : 'span 12'}
                            gridRow="span 2"
                            sx={{
                                backgroundColor: '#143024',
                                padding: '16px',
                                borderRadius: '8px',
                            }}
                        >
                            <Box
                                p="0 30px"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Typography 
                                    variant="h5" 
                                    fontWeight="600" 
                                    color="#ddbb68"
                                    sx={{
                                        fontSize: isMobile ? '16px' : '20px',
                                    }}
                                >
                                    Monthly Sales
                                </Typography>
                                <FormControl 
                                    sx={{
                                        minWidth: isMobile ? '3vw' : '5vw', 
                                        '.MuiSelect-root': {
                                            fontSize: isMobile ? '12px' : '16px',
                                        },
                                    }}
                                >
                                    <Select
                                        labelId="year-select-label"
                                        value={compareYear ? compareYear : years[years.length - 2]}
                                        onChange={(e) => setCompareYear(e.target.value)}
                                        sx={{
                                            fontSize: isMobile ? '0.8rem' : '16px', // Smaller font size for mobile
                                            minWidth: isMobile ? '80px' : '100px',
                                            color: '#ddbb68', 
                                            '.MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#ddbb68', 
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#ddbb68', 
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#ddbb68',
                                            },
                                            '.MuiSvgIcon-root': {
                                                color: '#ddbb68', 
                                            },
                                        }}
                                    >
                                        {years.map(year => (
                                            <MenuItem key={year} value={year}>{year}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box height="250px" ml="0px">
                                <LineChart filterYear={compareYear ? compareYear : years[years.length - 2]} />
                            </Box>
                        </Box>
                    )}

                    {/* Recent Transactions */}
                    {/* <Box
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
                    </Box> */}

                    {/* Monthly Top Items Chart */}
                    <Box
                        gridColumn={isMobile ? 'span 12' : 'span 6'}
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
                    {/* <Box
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
                    </Box> */}

                    {/* Restock Table */}
                    <Box
                        gridColumn={isMobile ? 'span 12' : 'span 6'}
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
                                Items to Restock: {restockData.length ? restockData.length : '0'}
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
