import React, { useEffect, useState } from 'react'; 
import { Link } from 'react-router-dom';
import API from '../../services/api'; 

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get('/admin/dashboard'); 
        setDashboardData(response.data.data); 
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch dashboard data.');
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); 

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>

      {loading && <p className="text-center text-gray-500">Loading dashboard data...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {dashboardData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Users</h2>
            <p className="text-4xl font-bold text-indigo-600">{dashboardData.totalUsers ?? 'N/A'}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Products</h2>
            <p className="text-4xl font-bold text-purple-600">{dashboardData.totalProducts ?? 'N/A'}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Orders</h2>
            <p className="text-4xl font-bold text-pink-600">{dashboardData.totalOrders ?? 'N/A'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <Link
          to="/admin/products"
          className="block bg-blue-600 text-white py-4 px-6 rounded-lg text-center font-semibold hover:bg-blue-700 transition duration-300 shadow hover:shadow-md"
        >
          Manage Products
        </Link>
        <Link
          to="/admin/users"
          className="block bg-green-600 text-white py-4 px-6 rounded-lg text-center font-semibold hover:bg-green-700 transition duration-300 shadow hover:shadow-md"
        >
          Manage Users
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;