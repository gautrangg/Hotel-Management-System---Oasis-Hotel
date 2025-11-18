import React from "react";
import { Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

export default function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/staff/login" replace />;
  }

  try {
    const payload = jwt_decode(token);
    const role = payload.role.toLowerCase();

    if (!allowedRoles.map(r => r.toLowerCase()).includes(role)) {
      return <Navigate to="/404" replace />;
    }

    return children;
  } catch (err) {
    console.error(err);
    return <Navigate to="/404" replace />;
  }
}
