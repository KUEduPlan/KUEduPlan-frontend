import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const loggedInStudentId = useSelector((state: any) => state.curriculum.loggedInStudentId);

  if (!loggedInStudentId) {
    // Redirect to login page if not logged in
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;