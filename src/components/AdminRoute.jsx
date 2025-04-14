import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const { user, token } = useSelector((state) => state.user);

  // Check if user is logged in and has the 'admin' role
  const isAdmin = token && user?.role === 'admin';
  // console.log(user);

  // If user is admin, allow access. Otherwise, redirect to home page.
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
