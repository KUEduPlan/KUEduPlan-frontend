import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Header from './components/Header';
import DistributionPage from './pages/DistributionPage';
import VisualizationPage from '../src/pages/Visualization';
import LoginPage from './pages/Login';

const theme = createTheme({
  typography: {
    fontFamily: 'Prompt, Arial, sans-serif',
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<VisualizationPage />} />
          <Route path="/distribution" element={<DistributionPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;