import React from 'react';
import { Navigate } from "react-router-dom";
import Home from '../pages/Home'; 
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ user, children }) => {
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
        return null;
  }
  
  // If the user is logged in, render the component that was passed in.
  return children;
};

export default ProtectedRoute;
