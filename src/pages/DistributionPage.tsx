import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import DistributionChart from '../components/DistributionChart';
import DeferCoursesTable from '../components/DeferCoursesTable';

const DistributionPage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ padding: '100px' }}>
        <Typography variant="h6" sx={{ marginBottom: '20px' }}>
          Distribution
        </Typography>
        <Box sx={{ marginX: '100px' }}>
          <DistributionChart />
        </Box>
        <Typography variant="h6" sx={{ marginTop: '40px', marginBottom: '20px' }}>
          Table of defer courses
        </Typography>
        <Box sx={{ marginX: '100px' }}>
          <DeferCoursesTable />
        </Box>
        <Button variant="contained"
        style={{
        backgroundColor: "#256E65",
    }} sx={{ marginTop: '20px' }}>
          Back
        </Button>
      </Box>
    </Box>
  );
};

export default DistributionPage;