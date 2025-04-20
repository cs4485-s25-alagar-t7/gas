import React from "react";
import { Navigate } from "react-router-dom";

const isAuthenticated = () => {
  return sessionStorage.getItem("adminLoggedIn") === "true";
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to="/admin" />;
};

export default ProtectedRoute;
