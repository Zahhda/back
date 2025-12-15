import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RouteDebugger = () => {
  const { user, logout, hasPermission } = useAuth();
  
  // Define all available routes in the application
  const routes = [
    { path: '/', name: 'Home' },
    { path: '/auth/login', name: 'Login' },
    { path: '/auth/property-owner/signup', name: 'Property Owner Signup' },
    { path: '/dashboard', name: 'Dashboard (General)' },
    { path: '/dashboard/property-searching', name: 'Property Searching Dashboard' },
    { path: '/dashboard/property-listing', name: 'Property Listing Dashboard' },
    { path: '/dashboard/admin', name: 'Admin Dashboard (Original)' },
    { path: '/admin/dashboard', name: 'Admin Dashboard (Alternate)' },
    { path: '/admin-fallback', name: 'Admin Dashboard (Fallback)' },
    { path: '/admin/direct', name: 'Admin Direct' },
    { path: '/debug/admin-dashboard', name: 'Debug Admin Dashboard' },
    { path: '/debug/admin-dashboard-simple', name: 'Debug Simple Admin Dashboard' },
    { path: '/debug/routes', name: 'Route Debugger (Current Page)' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Route Debugger
          </h1>
          
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Current Authentication State
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {user ? (
                <div>
                  <p><strong>Logged in as:</strong> {user.firstName} {user.lastName}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>User Type:</strong> {user.userType}</p>
                  <p><strong>User ID:</strong> {user.id}</p>
                  <p><strong>Has Admin Permission:</strong> {hasPermission('dashboard', 'view_admin') ? 'Yes' : 'No'}</p>
                  <button 
                    onClick={logout}
                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <p>Not logged in. <Link to="/auth/login" className="text-blue-500 hover:underline">Login now</Link></p>
              )}
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            All Available Routes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routes.map((route) => (
              <div 
                key={route.path} 
                className="border border-gray-200 dark:border-gray-700 rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  {route.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 font-mono">
                  {route.path}
                </p>
                <Link
                  to={route.path}
                  className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
                >
                  Navigate to this route
                </Link>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Troubleshooting Tips
            </h2>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <li>If you encounter a 404 error, check that the route exists in the App.tsx file</li>
              <li>Make sure you have the correct permissions for protected routes</li>
              <li>For admin routes, try the fallback options if the regular routes don't work</li>
              <li>Clear your browser cache or try in incognito mode if you encounter persistent issues</li>
              <li>Check the browser console for any JavaScript errors that might be preventing proper navigation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDebugger; 