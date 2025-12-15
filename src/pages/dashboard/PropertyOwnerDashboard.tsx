import React from "react";
// import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
// import { Button } from "@/components/ui/button";
import { Home, LogOut, Plus, Users, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
const PropertyListingDashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 shadow">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 sm:gap-0">
          <h1 className="flex-1 min-w-0 text-xl sm:text-2xl font-bold leading-tight text-gray-900 dark:text-white truncate">
            Property Listing Dashboard
          </h1>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              className="h-9 w-9 sm:h-10 sm:w-10"
            >
              <LogOut className="h-[1.1rem] w-[1.1rem] sm:h-[1.2rem] sm:w-[1.2rem]" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-zinc-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Properties
            </h2>

            {/* Example: Add new property (wire up your route if you have one) */}
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              <span>Add New Property</span>
            </Button>
          </div>

          {/* Cards grid */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Manage Listings */}
            <div className="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Manage Listings
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                View and edit your property listings
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Home className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  5 active listings
                </span>
              </div>

              {/* Use Link + Button (as a block) */}
              <Link
                to="/dashboard/MyProperties"
                className={buttonVariants({ variant: "default", className: "mt-4 w-full" })}
              >
                View All
              </Link>
            </div>

            {/* Inquiries */}
            <div className="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Inquiries
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage inquiries for your properties
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  12 new inquiries
                </span>
              </div>
              <Button className="mt-4 w-full" variant="outline">
                View Inquiries
              </Button>
            </div>

            {/* Analytics */}
            <div className="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Analytics
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                View statistics for your property listings
              </p>
              <div className="flex items-center gap-2 mt-3">
                <BarChart3 className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Weekly overview
                </span>
              </div>
              <Button className="mt-4 w-full" variant="outline">
                View Stats
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyListingDashboard;
