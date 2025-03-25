import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "./state/store";
import Header from "./components/Header";
import DistributionPage from "./pages/DistributionPage";
import VisualizationPage from "./pages/Visualization";
import LoginPage from "./pages/Login";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentListPage from "./pages/StudentListPage";
import OpenPlanSettingPage from "./pages/OpenPlanSettingPage";
import NotFoundPage from "./pages/NotFoundPage";
import Loading from "./components/Loading";

const theme = createTheme({
  typography: {
    fontFamily: "Prompt, Arial, sans-serif",
  },
});

const basename = process.env.REACT_APP_BASE_URL || "/";

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const role = useSelector((state: RootState) => state.curriculum.role);
  const loggedIn = useSelector((state: RootState) => state.curriculum.loggedIn);

  // Simulate an authentication check
  useEffect(() => {
    const checkAuth = async () => {
      // Simulate a delay for authentication check
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename={basename}>
        <Header />
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute
                loggedIn={loggedIn}
                role={role}
                allowedRoles={["student", "advisor", "curriculum_admin"]}
              >
                <VisualizationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visualization/:studentId"
            element={
              <ProtectedRoute
                loggedIn={loggedIn}
                role={role}
                allowedRoles={["student", "advisor", "curriculum_admin"]}
              >
                <VisualizationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/distribution"
            element={
              <ProtectedRoute
                loggedIn={loggedIn}
                role={role}
                allowedRoles={["curriculum_admin"]}
              >
                <DistributionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course-details/:courseCode"
            element={
              <ProtectedRoute
                loggedIn={loggedIn}
                role={role}
                allowedRoles={["student", "advisor", "curriculum_admin"]}
              >
                <CourseDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-list"
            element={
              <ProtectedRoute
                loggedIn={loggedIn}
                role={role}
                allowedRoles={["advisor", "curriculum_admin"]}
              >
                <StudentListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/openplan-setting"
            element={
              <ProtectedRoute
                loggedIn={loggedIn}
                role={role}
                allowedRoles={["curriculum_admin"]}
              >
                <OpenPlanSettingPage />
              </ProtectedRoute>
            }
          />

          {/* Redirect to login if not authenticated */}
          <Route
            path="/"
            element={loggedIn ? <Navigate to="/" /> : <Navigate to="/login" />}
          />

          {/* 404 Not Found Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
