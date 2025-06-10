// src/screens/ProtectedRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/LoginService";

function ProtectedRoute({ children }) {
    return isAuthenticated() ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
