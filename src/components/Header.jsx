import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';

const Header = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user); // Lấy thông tin người dùng từ Redux store
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Trạng thái mở/đóng menu

  const handleLogout = () => {
    dispatch(logout()); // Xóa thông tin người dùng khỏi Redux store
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Đổi trạng thái menu
  };

  // Close dropdown when clicking outside
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Check if user is an admin
  const isAdmin = user && user.role === 'admin';

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <h1 className="text-2xl font-bold">
          <Link to="/">E-Commerce</Link>
        </h1>
        <nav className="flex space-x-6 items-center">
          <Link to="/" className="hover:text-gray-200">Home</Link>
          <Link to="/cart" className="hover:text-gray-200">Cart</Link>
          {user ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="hover:text-gray-200 focus:outline-none flex items-center"
              >
                {user.name} 
                {isAdmin && <span className="ml-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Admin</span>}
                <span className="ml-1">▼</span>
              </button>
              {isDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 bg-white text-black shadow-lg rounded-md z-10 w-48" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-200"
                    onClick={closeDropdown}
                  >
                    Profile
                  </Link>
                  
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 hover:bg-gray-200 text-blue-700 font-medium"
                      onClick={closeDropdown}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      closeDropdown();
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-200 border-t border-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-200">Login</Link>
              <Link to="/register" className="hover:text-gray-200">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;