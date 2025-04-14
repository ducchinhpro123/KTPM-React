import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const { token } = useSelector((state) => state.user);
  const location = useLocation();

  // If user is not logged in, redirect to login page with returnUrl
  if (!token) {
    return <Navigate to="/login" state={{ returnUrl: location.pathname }} replace />;
  }

  // If user is logged in, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;