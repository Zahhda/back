import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { CalendarClock, Users, Building, CreditCard } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-card rounded-xl shadow-sm p-3 md:p-4 border border-border/40">
    <div className="flex items-center">
      <div className={`w-9 h-9 md:w-12 md:h-12 rounded-lg ${color} flex items-center justify-center text-white mr-3 md:mr-4`}>
        {/* icon size scales on mobile */}
        <div className="[*]:h-4 [*]:w-4 md:[*]:h-5 md:[*]:w-5">{icon}</div>
      </div>
      <div>
        <p className="text-muted-foreground text-xs md:text-sm">{title}</p>
        <p className="text-lg md:text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

interface WelcomeBannerProps {
  showStats?: boolean;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ showStats = true }) => {
  const { user } = useAuth();

  if (!user) return null;

  // Define different welcome messages and stats based on user type
  const getUserContent = () => {
    switch (user.userType) {
      case 'admin':
        return {
          title: "Admin Dashboard",
          message: "Monitor and manage all aspects of the platform.",
          stats: [
            // { title: "Total Users", value: 15482, icon: <Users size={20} />, color: "bg-blue-500" },
            // { title: "Properties", value: 4382, icon: <Building size={20} />, color: "bg-emerald-500" },
            // { title: "New Bookings", value: 147, icon: <CalendarClock size={20} />, color: "bg-amber-500" },
            // { title: "Revenue", value: "₹458,200", icon: <CreditCard size={20} />, color: "bg-purple-500" }
          ]
        };
      case 'property_listing':
        return {
          title: "Property Owner Dashboard",
          message: "Manage your properties and monitor your rental business.",
          stats: [
            // { title: "Your Properties", value: 8, icon: <Building size={20} />, color: "bg-blue-500" },
            // { title: "Active Listings", value: 6, icon: <Building size={20} />, color: "bg-emerald-500" },
            // { title: "Booking Requests", value: 12, icon: <CalendarClock size={20} />, color: "bg-amber-500" },
            // { title: "Monthly Earnings", value: "₹84,500", icon: <CreditCard size={20} />, color: "bg-purple-500" }
          ]
        };
      case 'property_searching':
      default:
        return {
          title: "Your Dashboard",
          message: "Explore properties and manage your bookings.",
          stats: [
            // { title: "Saved Properties", value: 24, icon: <Building size={20} />, color: "bg-blue-500" },
            // { title: "Upcoming Viewings", value: 3, icon: <CalendarClock size={20} />, color: "bg-emerald-500" },
            // { title: "Active Bookings", value: 2, icon: <Building size={20} />, color: "bg-amber-500" },
            // { title: "Spent this Month", value: "₹32,000", icon: <CreditCard size={20} />, color: "bg-purple-500" }
          ]
        };
    }
  };

  const content = getUserContent();

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500/30 to-purple-500/30 dark:from-indigo-950 dark:to-purple-950 p-4 md:p-6">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-30">
        <svg className="absolute right-0 top-0 h-full w-full" viewBox="0 0 80 80" preserveAspectRatio="none">
          <circle cx="0" cy="0" r="80" fill="white" fillOpacity="0.1" />
          <circle cx="80" cy="0" r="40" fill="white" fillOpacity="0.1" />
          <circle cx="80" cy="80" r="60" fill="white" fillOpacity="0.1" />
          <circle cx="0" cy="80" r="40" fill="white" fillOpacity="0.1" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-white/20 text-white backdrop-blur-sm mb-3 md:mb-4">
              {getGreeting()}
            </div>
            <h1 className="text-xl md:text-3xl font-bold text-white leading-tight">
              Welcome back, {user.firstName}!
            </h1>
            <p className="mt-1.5 md:mt-2 text-white/80 text-sm md:text-base">
              {content.message}
            </p>
          </div>

          <div className="mt-3 md:mt-0">
            {/* <Button className="bg-white text-indigo-600 hover:bg-white/90">
              {user.userType === 'property_listing' 
                ? 'Add New Property' 
                : user.userType === 'admin' 
                  ? 'View Analytics' 
                  : 'Browse Properties'}
            </Button> */}
          </div>
        </div>

        {showStats && (
          <div className="mt-4 md:mt-6 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {content.stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeBanner; 