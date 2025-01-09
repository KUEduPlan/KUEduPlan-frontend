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
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Number of years required to graduate',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of student',
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default DistributionChart;