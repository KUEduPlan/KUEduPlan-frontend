import React, { useState } from 'react';
import { Box, Typography, Checkbox, Button } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import DistributionChart from '../components/DistributionChart';
import { useNavigate } from 'react-router-dom';

const CourseDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [eligibleData, setEligibleData] = useState({
    year2: 3,
    year3: 4,
    year4: 2,
  });

  const handleCheckboxChange = (year: string) => {
    setEligibleData((prev) => ({ ...prev, [year]: 0 }));
  };

  const data1 = {
    labels: ['65 (Year 2)', '64 (Year 3)', '63 (Year 4)', '>63 (Year >4)'],
    datasets: [
      {
        label: 'Eligible to enroll',
        data: [eligibleData.year2, eligibleData.year3, eligibleData.year4, 1],
        backgroundColor: '#256E65',
      },
      {
        label: 'Ineligible to enroll',
        data: [6, 5, 4, 3],
        backgroundColor: '#A9A9A9',
      },
    ],
  };

  const options1 = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          font: {
            family: 'Prompt, Arial, sans-serif',
            size: 14,
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Number of Students',
          font: {
            family: 'Prompt, Arial, sans-serif',
            size: 14,
          },
        },
        ticks: {
          font: {
            family: 'Prompt, Arial, sans-serif',
            size: 12,
          },
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Student Academic Year',
          font: {
            family: 'Prompt, Arial, sans-serif',
            size: 14,
          },
        },
        ticks: {
          font: {
            family: 'Prompt, Arial, sans-serif',
            size: 12,
          },
        },
      },
    },
  };

  return (
    <Box sx={{ padding: '80px' }}>
      <Typography variant="h5" sx={{ marginBottom: '20px', textAlign: 'left' }}>
        Distribution
      </Typography>
      <Typography variant="h6" sx={{ marginBottom: '20px', textAlign: 'left' }}>
        01219114 - Computer Programming I
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          gap: '10px',
        }}
      >
        <Box sx={{ flex: 2, height: '700px' }}>
          <Bar data={data1} options={options1} />
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="body1" sx={{ marginBottom: '10px' }}>
            Assume this course is available next semester without conflicts for:
          </Typography>
          <Box>
            <Checkbox
              checked={eligibleData.year2 === 0}
              onChange={() => handleCheckboxChange('year2')}
            />
            <Typography variant="body2" display="inline">
              Year 2
            </Typography>
          </Box>
          <Box>
            <Checkbox
              checked={eligibleData.year3 === 0}
              onChange={() => handleCheckboxChange('year3')}
            />
            <Typography variant="body2" display="inline">
              Year 3
            </Typography>
          </Box>
          <Box>
            <Checkbox
              checked={eligibleData.year4 === 0}
              onChange={() => handleCheckboxChange('year4')}
            />
            <Typography variant="body2" display="inline">
              Year 4
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '70%', height: '700px' }}>
          <Typography variant="h6" sx={{ marginBottom: '20px', textAlign: 'center' }}>
            Number of student vs. Number of years required to graduate
          </Typography>
          <DistributionChart />
        </Box>
      </Box>
      <Button
        variant="contained"
        style={{
          backgroundColor: '#256E65',
        }}
        sx={{ marginTop: '20px' }}
        onClick={() => navigate('/distribution')}
      >
        Back
      </Button>
    </Box>
  );
};

export default CourseDetailsPage;