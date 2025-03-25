import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  loggedIn: boolean;
  role: string | null;
  allowedRoles: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  loggedIn,
  role,
  allowedRoles,
  children,
}) => {
  if (!loggedIn) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role!)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
