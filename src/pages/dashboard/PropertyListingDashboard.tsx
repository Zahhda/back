import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Home, LogOut, Plus, Users } from "lucide-react";
import PropertyListingWithPagination from '@/components/PropertyListingWithPagination';

const PropertyListingDashboard = () => {
  const navigate = useNavigate();

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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center">
          <h1 className="text-sm max-[360px]:text-xs sm:text-2xl font-bold leading-tight text-gray-900 dark:text-white truncate">
            Property Listing Dashboard
          </h1>
        </div>
      </header>


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-zinc-800 shadow rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-sm sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
              Dashboard Overview
            </h2>

            <Button
              className="flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm md:text-base px-3 sm:px-4 w-full sm:w-auto"
              onClick={() => navigate('/dashboard/properties/add')}
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Add New Property</span>
            </Button>
          </div>


          <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 dark:bg-zinc-700 p-3 sm:p-4 rounded-lg shadow-sm">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Manage Listings</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                View and edit your property listings
              </p>
              <div className="flex items-center gap-2 mt-2.5 sm:mt-3">
                <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">5 active listings</span>
              </div>
              <Button className="mt-3 sm:mt-4 w-full h-9 sm:h-10 text-xs sm:text-sm md:text-base">View All</Button>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-700 p-3 sm:p-4 rounded-lg shadow-sm">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Inquiries</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                Manage inquiries for your properties
              </p>
              <div className="flex items-center gap-2 mt-2.5 sm:mt-3">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">12 new inquiries</span>
              </div>
              <Button className="mt-3 sm:mt-4 w-full h-9 sm:h-10 text-xs sm:text-sm md:text-base" variant="outline">
                View Inquiries
              </Button>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-700 p-3 sm:p-4 rounded-lg shadow-sm">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Analytics</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                View statistics for your property listings
              </p>
              <Button className="mt-3 sm:mt-4 w-full h-9 sm:h-10 text-xs sm:text-sm md:text-base" variant="outline">
                View Status
              </Button>
            </div>
          </div>

        </div>

        {/* <div className="bg-white dark:bg-zinc-800 shadow rounded-lg">
          <PropertyListingWithPagination />
        </div> */}

      </main>
    </div>
  );
};

export default PropertyListingDashboard; 