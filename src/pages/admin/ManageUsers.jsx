import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // User đang được chỉnh sửa
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user', password: '' }); // User mới
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Lấy danh sách người dùng
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await API.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  // Thêm người dùng mới
  const handleAddUser = async () => {
    setNotification({ type: '', message: '' });
    try {
      await API.post('/users', newUser);
      fetchUsers(); // Refresh danh sách người dùng
      setNewUser({ name: '', email: '', role: 'user', password: '' }); // Reset form
      setNotification({ type: 'success', message: 'User added successfully.' });
    } catch (error) {
      console.error('Failed to add user:', error);
      setNotification({ type: 'error', message: `Failed to add user: ${error.message}` });
    }
  };

  // Sửa thông tin người dùng
  const handleUpdateUser = async () => {
    try {
      await API.put(`/users/${editingUser._id}`, editingUser);
      fetchUsers(); // Refresh danh sách người dùng
      setEditingUser(null); // Reset form chỉnh sửa
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  // Xóa người dùng
  const handleDeleteUser = async (id) => {
    try {
      await API.delete(`/users/${id}`);
      fetchUsers(); // Refresh danh sách người dùng
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      {notification.message && (
        <div className={`mb-4 p-2 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}
      <h1 className="text-3xl font-bold text-center mb-8">Manage Users</h1>

      {/* Form thêm người dùng */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="border p-2 rounded-lg mr-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="border p-2 rounded-lg mr-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          className="border p-2 rounded-lg mr-2"
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          className="border p-2 rounded-lg mr-2"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={handleAddUser}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Add User
        </button>
      </div>

      {/* Danh sách người dùng */}
      <div>
        <h2 className="text-xl font-semibold mb-4">User List</h2>
        <ul className="space-y-4">
          {users.map((user) => (
            <li
              key={user._id}
              className="flex justify-between items-center border p-4 rounded-lg shadow-md"
            >
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-gray-600">Role: {user.role}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingUser(user)} // Mở form chỉnh sửa
                  className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Form chỉnh sửa người dùng */}
      {editingUser && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Edit User</h2>
          <input
            type="text"
            placeholder="Name"
            value={editingUser.name}
            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
            className="border p-2 rounded-lg mr-2"
          />
          <input
            type="email"
            placeholder="Email"
            value={editingUser.email}
            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
            className="border p-2 rounded-lg mr-2"
          />
          <select
            value={editingUser.role}
            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
            className="border p-2 rounded-lg mr-2"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleUpdateUser}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
          >
            Save Changes
          </button>
          <button
            onClick={() => setEditingUser(null)} // Hủy chỉnh sửa
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition ml-2"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;