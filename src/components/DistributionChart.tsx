import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DistributionChart: React.FC = () => {
  const data = {
    labels: ['4', '4.5', '5', '5.5', '6'],
    datasets: [
      {
        label: 'Number of student',
        data: [5, 4, 4, 3, 2],
        backgroundColor: '#256E65',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        labels: {
          font: {
            family: 'Prompt, Arial, sans-serif',
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Number of years required to graduate',
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
        title: {
          display: true,
          text: 'Number of student',
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

  return <Bar data={data} options={options} />;
};

export default DistributionChart;