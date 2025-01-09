import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#256E65' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          KU EduPlan
        </Typography>
        <Box sx={{ display: 'flex', gap: '20px' }}>
          <Typography component={Link} to="/" sx={{ color: 'white', textDecoration: 'none' }}>
            Plan
          </Typography>
          <Typography component={Link} to="/distribution" sx={{ color: 'white', textDecoration: 'none' }}>
            Distribution
          </Typography>
          <Typography component={Link} to="/login" sx={{ color: 'white', textDecoration: 'none' }}>
            Login
          </Typography>
          <Typography sx={{ color: 'white' }}>Contact</Typography>
          <Typography sx={{ color: 'white' }}>E8888 Asst. Prof. Iamthe Administrator</Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;