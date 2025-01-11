import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import DistributionChart from '../components/DistributionChart';
import DeferCoursesTable from '../components/DeferCoursesTable';
import { useNavigate } from 'react-router-dom';

const DistributionPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <Box sx={{ padding: '80px' }}>
        <Typography variant="h5" sx={{ marginBottom: '20px' }}>
          Distribution
        </Typography>
        <Box sx={{ marginX: '100px', width: '70%', height: '700px', margin: '0 auto' }}>
          <DistributionChart />
        </Box>
        <Typography variant="h6" sx={{ marginTop: '40px', marginBottom: '20px' }}>
          Table of defer courses
        </Typography>
        <Box sx={{ marginX: '100px' }}>
          <DeferCoursesTable />
        </Box>
        <Button
          variant="contained"
          style={{
            backgroundColor: '#256E65',
          }}
          sx={{ marginTop: '20px' }}
          onClick={() => navigate('/')}
        >
          Back
        </Button>
      </Box>
    </Box>
  );
};

export default DistributionPage;