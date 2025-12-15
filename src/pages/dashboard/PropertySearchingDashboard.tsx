import React from 'react';
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut, Search, Heart, Bell } from "lucide-react";
import PropertyListingWithPagination from '@/components/PropertyListingWithPagination';

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Your Dream Property</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Heart className="h-[1.2rem] w-[1.2rem]" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-[1.2rem] w-[1.2rem]" />
            </Button>
            <ThemeToggle />
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-zinc-800 shadow rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Welcome to your property search
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Find the perfect property based on your preferences
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="flex items-center gap-2">
                <Heart size={16} />
                <span>Saved Properties</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Search size={16} />
                <span>Saved Searches</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Property listings with pagination */}
        <div className="bg-white dark:bg-zinc-800 shadow rounded-lg">
          <PropertyListingWithPagination />
        </div>
      </main>
    </div>
  );
};

export default PropertySearchingDashboard; 