import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronRight,
  Home,
  Users,
  Building,
  User,
  CreditCard,
  BarChart2,
  Star,
  Shield,
  Bell,
  FileText,
  Settings,
  Calendar,
  Heart,
  LogOut,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  className?: string;
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  permissionRequired?: { module: string; action: string };
  userTypes?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = mobileOpen ? 'hidden' : '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: user?.userType === 'admin' ? '/admin-fallback' : '/dashboard',
      permissionRequired: { module: 'dashboard', action: 'view' },
    },
    {
      title: 'User Management',
      icon: <Users className="h-5 w-5" />,
      path: '/admin/users',
      permissionRequired: { module: 'user_management', action: 'view' },
      userTypes: ['admin'],
    },
    {
      title: 'Property Management',
      icon: <Building className="h-5 w-5" />,
      path: '/admin/property-management',
      permissionRequired: { module: 'property_management', action: 'view' },
      userTypes: ['admin'],
    },
    {
      title: 'Role Management',
      icon: <Shield className="h-5 w-5" />,
      path: '/admin/roles',
      permissionRequired: { module: 'roles', action: 'view' },
      userTypes: ['admin'],
    },
    {
      title: 'Permission Management',
      icon: <Shield className="h-5 w-5" />,
      path: '/admin/permissions',
      permissionRequired: { module: 'permissions', action: 'view' },
      userTypes: ['admin'],
    },
    {
      title: 'Role-Permission Assignment',
      icon: <Shield className="h-5 w-5" />,
      path: '/admin/role-permissions',
      permissionRequired: { module: 'roles', action: 'edit' },
      userTypes: ['admin'],
    },
    {
      title: 'My Properties',
      icon: <Building className="h-5 w-5" />,
      path: '/dashboard/property-listing',
      permissionRequired: { module: 'property_management', action: 'view' },
      userTypes: ['property_listing'],
    },
    {
      title: 'Booking Requests',
      icon: <Calendar className="h-5 w-5" />,
      path: '/dashboard/booking-requests',
      permissionRequired: { module: 'booking', action: 'view' },
      userTypes: ['property_listing'],
    },
    {
      title: 'Payments & Earnings',
      icon: <CreditCard className="h-5 w-5" />,
      path: '/dashboard/payments',
      permissionRequired: { module: 'payment_reports', action: 'view' },
      userTypes: ['property_listing'],
    },
    {
      title: 'Reviews & Ratings',
      icon: <Star className="h-5 w-5" />,
      path: '/dashboard/reviews',
      permissionRequired: { module: 'review_management', action: 'view' },
      userTypes: ['property_listing'],
    },
    {
      title: 'Subscription',
      icon: <CreditCard className="h-5 w-5" />,
      path: '/dashboard/subscription',
      permissionRequired: { module: 'subscription_plans', action: 'view' },
      userTypes: ['property_listing'],
    },
    {
      title: 'My Properties',
      icon: <CreditCard className="h-5 w-5" />,
      path: '/dashboard/MyProperties',
      userTypes: ['property_listing'],
    },
    {
      title: 'My Bookings',
      icon: <Calendar className="h-5 w-5" />,
      path: '/dashboard/bookings',
      permissionRequired: { module: 'booking', action: 'view' },
      userTypes: ['property_searching'],
    },
    {
      title: 'Wishlist',
      icon: <Heart className="h-5 w-5" />,
      path: '/dashboard/wishlist',
      permissionRequired: { module: 'wishlist', action: 'view' },
      userTypes: ['property_searching'],
    },
    {
      title: 'My Reviews',
      icon: <Star className="h-5 w-5" />,
      path: '/dashboard/my-reviews',
      permissionRequired: { module: 'review_management', action: 'view' },
      userTypes: ['property_searching'],
    },
    {
      title: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      path: '/dashboard/notifications',
      permissionRequired: { module: 'notification_center', action: 'view' },
    },
    {
      title: 'Profile',
      icon: <User className="h-5 w-5" />,
      path: '/dashboard/profile',
      // permissionRequired: { module: 'profile', action: 'view' },

    }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.userTypes && !item.userTypes.includes(user?.userType || '')) {
      return false;
    }
    if (item.permissionRequired) {
      const { module, action } = item.permissionRequired;
      if (module === 'dashboard' && action === 'view' && user?.userType === 'admin') {
        return true;
      }
      if (hasPermission && typeof hasPermission === 'function') {
        return hasPermission(module, action);
      }
      if (user?.userType === 'admin') {
        return true;
      }
    }
    return true;
  });

  const sidebarClasses = cn(
    "bg-card border-r flex flex-col transition-all duration-300 overflow-y-auto",
    {
      "h-screen fixed inset-y-0 left-0 z-50 w-64": isMobile,
      "lg:w-64 h-screen": !collapsed && !isMobile,
      "lg:w-20 h-screen": collapsed && !isMobile,
      "translate-x-0": mobileOpen,
      "-translate-x-full": !mobileOpen && isMobile,
    },
    className
  );

  return (
    <>
  {isMobile && (
  <div className="fixed top-2 left-2 z-[9999]">   {/* ⬅ higher z-index */}
    <Button
      variant="outline"
      size="icon"
      className="lg:hidden shadow-md bg-background"
      onClick={toggleSidebar}
    >
      {mobileOpen ? (
        <X className="h-5 w-5 text-black dark:text-white" />
      ) : (
        <Menu className="h-5 w-5 text-black dark:text-white" />
      )}
    </Button>
  </div>
)}



      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={sidebarClasses}>
        <div className="p-2 flex items-center justify-between border-b">
          <div className="flex items-center justify-center w-full py-1">
            <Link to="/">
              <img
                src="/high_res_logo.png"
                alt="Property Listing Logo"
                className={cn(
                  "transition-all duration-300 object-contain",
                  collapsed ? "w-12 h-12" : "w-16 h-16"
                )}
              />
            </Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn("hidden lg:flex absolute right-2", { "ml-auto": collapsed })}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", { "rotate-180": !collapsed })} />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-2">
            {filteredMenuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 text-xs sm:text-sm rounded-md transition-colors hover:bg-muted", // ⬅ text-xs in mobile, sm:text-sm otherwise
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground"
                  )}
                  onClick={() => isMobile && setMobileOpen(false)}
                >
                  <span className="mr-2 flex-shrink-0">{item.icon}</span>
                  <span
                    className={cn("transition-opacity", {
                      "opacity-0 lg:w-0 lg:hidden": collapsed && !isMobile,
                      "opacity-100": !collapsed || isMobile
                    })}
                  >
                    {item.title}
                  </span>
                </Link>

              </li>
            ))}
          </ul>

          {/* QUICK ACCESS SECTION BELOW */}
          <div className="px-4 pt-6 pb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Quick Access
            </h3>
            <ul className="space-y-1">
              {/* All Property
              <li>
                <Link
                  to="/dashboard/property-listing"
                  className={cn(
                    "flex items-center px-4 py-2 text-sm rounded-md transition-colors hover:bg-muted",
                    location.pathname === "/dashboard/property-listing"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground"
                  )}
                >
                  <Building className="h-4 w-4 mr-2" />
                  All Properties
                </Link>
              </li> */}


              {/* Shortlisted Properties */}
              <li>
                <Link
                  to="/dashboard/WishlistPage"
                  className={cn(
                    "flex items-center px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm rounded-md transition-colors hover:bg-muted",
                    location.pathname === "/dashboard/WishlistPage"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground"
                  )}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Your Shortlists
                </Link>
              </li>

              {/* Order History */}
              <li>
                <Link
                  to="/dashboard/TransactionHistory"
                  className={cn(
                    "flex items-center px-4 py-2 text-xs sm:text-sm rounded-md transition-colors hover:bg-muted",
                    location.pathname === "/dashboard/TransactionHistory"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground"
                  )}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Order History
                </Link>
              </li>

              {/* Rental Transaction */}
              <li>
                <Link
                  to="/dashboard/RentalTransaction"
                  className={cn(
                    "flex items-center px-4 py-2 text-xs sm:text-sm rounded-md transition-colors hover:bg-muted",
                    location.pathname === "/dashboard/RentalTransaction"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground"
                  )}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Rental Transaction
                </Link>
              </li>
            </ul>
          </div>
        </nav>


        <div className="p-4 border-t mt-auto">
          <Button
            variant="ghost"
            className={cn("w-full justify-start text-muted-foreground", {
              "px-2": collapsed && !isMobile
            })}
            onClick={logout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className={cn("transition-opacity", {
              "opacity-0 lg:w-0 lg:hidden": collapsed && !isMobile,
              "opacity-100": !collapsed || isMobile
            })}>
              Logout
            </span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
