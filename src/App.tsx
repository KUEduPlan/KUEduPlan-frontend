import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./state/store";
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
import { checkAuth } from "./state/actions";
import { UserRole } from "./types/types";

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
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await dispatch(checkAuth()).unwrap();
      } catch (error) {
        console.log("No valid session found");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (isLoading) {
    return <Loading />;
  }

  const isValidRole = (role: string | undefined | null): role is UserRole => {
    return ["student", "advisor", "curriculum_admin"].includes(role || "");
  };

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
                role={isValidRole(role) ? role : undefined}
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
                role={isValidRole(role) ? role : undefined}
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
                role={isValidRole(role) ? role : undefined}
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
                role={isValidRole(role) ? role : undefined}
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
                role={isValidRole(role) ? role : undefined}
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
                role={isValidRole(role) ? role : undefined}
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
