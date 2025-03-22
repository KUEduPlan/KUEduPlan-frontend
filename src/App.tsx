import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Header from "./components/Header";
import DistributionPage from "./pages/DistributionPage";
import VisualizationPage from "./pages/Visualization";
import LoginPage from "./pages/Login";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentListPage from "./pages/StudentListPage";
import OpenPlanSettingPage from "./pages/OpenPlanSettingPage";

const theme = createTheme({
  typography: {
    fontFamily: "Prompt, Arial, sans-serif",
  },
});

// TODO: Remove protected comment
const basename = process.env.REACT_APP_BASE_URL || "/";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename={basename}>
        <Header />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              //<ProtectedRoute>
                <VisualizationPage />
              //</ProtectedRoute>
            }
          />
          <Route
            path="/visualization/:studentId"
            element={
              //<ProtectedRoute>
              <VisualizationPage />
              //</ProtectedRoute>
            }
          />
          <Route
            path="/distribution"
            element={
              //<ProtectedRoute>
                <DistributionPage />
              //</ProtectedRoute>
            }
          />
          <Route
            path="/course-details/:courseCode"
            element={
              //<ProtectedRoute>
                <CourseDetailsPage />
              //</ProtectedRoute>
            }
          />
          <Route
            path="/student-list"
            element={
              //<ProtectedRoute>
                <StudentListPage />
              //</ProtectedRoute>
            }
          />
          <Route
            path="/openplan-setting"
            element={
              //<ProtectedRoute>
                <OpenPlanSettingPage />
              //</ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;