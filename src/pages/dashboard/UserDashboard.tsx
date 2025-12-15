import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const PropertySearchingDashboard = () => {
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Redirect to login page
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Property Searching Dashboard</h1>
          <div className="flex items-center gap-4">
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
            Welcome to your dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Here you can search for properties and manage your saved searches.
          </p>
          
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-white">Find Properties</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Search for properties based on your preferences
              </p>
              <Button className="mt-4 w-full">Start Searching</Button>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-white">Saved Searches</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                View and manage your saved property searches
              </p>
              <Button className="mt-4 w-full" variant="outline">View Saved</Button>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-white">Contact Agents</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Get in touch with property agents
              </p>
              <Button className="mt-4 w-full" variant="outline">Contact</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertySearchingDashboard; 