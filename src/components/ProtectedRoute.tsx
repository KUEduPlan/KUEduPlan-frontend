import React from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";
import { UserRole } from "../types/types";

interface ProtectedRouteProps {
  loggedIn?: boolean;
  role?: UserRole;
  allowedRoles: UserRole[];
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  loggedIn,
  role,
  allowedRoles,
  children,
}) => {
  if (loggedIn === undefined) {
    return <Loading />;
  }

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
