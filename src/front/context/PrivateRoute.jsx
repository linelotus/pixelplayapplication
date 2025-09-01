import React from 'react';
import { HomePage } from '../front/pages/HomePage'; // We need to import HomePage

const PrivateRoute = ({ user, children }) => {
  // If the user is not logged in, render the HomePage as a fallback.
  // In a real-world app with a library like React Router, you'd use a <Navigate> component.
  if (!user) {
    return <HomePage />;
  }
  
  // If the user is logged in, render the component that was passed in.
  return children;
};

export default PrivateRoute;
