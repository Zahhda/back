import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminDirect = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Direct Access</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        {user ? (
          <div>
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Type:</strong> {user.userType}</p>
            <p><strong>Status:</strong> {user.status}</p>
          </div>
        ) : (
          <p>Not logged in</p>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Debug Links</h2>
        <div className="space-y-2">
          <p><Link to="/admin/dashboard" className="text-blue-500 hover:underline">Admin Dashboard (with layout)</Link></p>
          <p><Link to="/debug/admin-dashboard-simple" className="text-blue-500 hover:underline">Simple Admin Dashboard</Link></p>
          <p><Link to="/dashboard" className="text-blue-500 hover:underline">Main Dashboard (redirect)</Link></p>
          <p><Link to="/" className="text-blue-500 hover:underline">Home Page</Link></p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Debugging Information</h2>
        <div className="space-y-2">
          <p><strong>Current URL:</strong> {window.location.href}</p>
          <p><strong>Path:</strong> {window.location.pathname}</p>
          <p><strong>Browser:</strong> {navigator.userAgent}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDirect; 