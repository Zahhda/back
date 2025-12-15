import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Users, Home, BarChart3 } from "lucide-react";

const AdminDashboard = () => {
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Redirect to login page
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
     <header className="sticky top-0 z-50 border-b bg-white dark:bg-zinc-800">
  <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 flex justify-between items-center">
    <h1 className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
      Admin Dashboard
    </h1>
    <div className="flex items-center gap-2 sm:gap-4">
      <ThemeToggle />
      <Button variant="outline" size="icon" onClick={handleLogout}>
        <LogOut className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    </div>
  </div>
</header>

      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-zinc-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Admin Control Panel
          </h2>
          
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-white">User Management</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage all users in the system
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">150 total users</span>
              </div>
              <Link to="/admin/user-management">
                <Button className="mt-4 w-full">Manage Users</Button>
              </Link>
            </div>
            
            <div className="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-white">Property Management</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage all property listings
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Home className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">85 active listings</span>
              </div>
              <Link to="/admin/property-management">
                <Button className="mt-4 w-full">Manage Properties</Button>
              </Link>
            </div>
            
            <div className="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-white">Analytics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                View system statistics and reports
              </p>
              <div className="flex items-center gap-2 mt-3">
                <BarChart3 className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Daily reports</span>
              </div>
              <Button className="mt-4 w-full" variant="outline">View Analytics</Button>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-white">System Settings</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Configure system settings and parameters
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Settings className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Configuration</span>
              </div>
              <Button className="mt-4 w-full" variant="outline">System Settings</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 