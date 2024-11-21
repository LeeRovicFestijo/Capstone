import React from 'react';
import { Box, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const StatBox = ({ title, subtitle, icon }) => {
    // Create a custom theme with responsive typography
    const theme = createTheme({
        typography: {
            fontFamily: 'Poppins, sans-serif',
            h4: {
                fontWeight: 'bold',
                color: 'white',
                '@media (max-width: 1366px)': {
                    fontSize: '1.5rem', // Smaller font on tablets
                },
                '@media (max-width: 1024px)': {
                    fontSize: '1rem', // Smaller font on tablets
                },
                '@media (max-width: 768px)': {
                    fontSize: '1.5rem', // Smaller font on mobile
                },
            },
            h5: {
                fontWeight: '400',
                color: '#ddbb68',
                '@media (max-width: 1366px)': {
                    fontSize: '1.2rem', // Smaller font on tablets
                },
                '@media (max-width: 1024px)': {
                    fontSize: '0.8rem', // Smaller font on tablets
                },
                '@media (max-width: 768px)': {
                    fontSize: '1.2rem', // Smaller font on mobile
                },
            },
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box width={"100%"} m={"0 30px"}>
                <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
                    <Box>
                        <Typography variant='h5'>
                            {title}
                        </Typography>
                        <Typography variant='h4'>
                            {subtitle}
                        </Typography>
                    </Box>
                    <Box display={"flex"} alignItems={'center'}>
                        {icon}
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default StatBox;
