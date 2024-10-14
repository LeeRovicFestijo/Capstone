import React from 'react'
import { Box, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const StatBox = ({ title, subtitle, icon }) => {
    const theme = createTheme({
        typography: {
          fontFamily: 'Poppins, sans-serif', // Use Poppins as the default font
        },
      });

  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box width={"100%"} m={"0 30px"}>
            <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
                <Box>
                    <Typography variant='h5' fontWeight={"400"} color="#ddbb68">
                        {title}
                    </Typography>
                    <Typography variant='h4' fontWeight={"bold"} color="white">
                        {subtitle}
                    </Typography>
                </Box>
                <Box display={"flex"} alignItems={'center'}>
                    {icon}
                </Box>
            </Box>
        </Box>
    </ThemeProvider>
  )
}

export default StatBox;