import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../components/theme-provider';
import { Button } from './ui/button';
import { ChevronLeft, LogOut, Moon, Sun } from 'lucide-react';

const TopHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    try {
      logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleTheme = () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    } catch (error) {
      console.error('Theme toggle failed:', error);
    }
  };

  const getThemeIcon = () => {
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      return systemTheme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />;
    }
    return theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />;
  };

  // Function to get page title and navigation info
  const getPageInfo = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);

    // Default values
    let mainTitle = "Property Listing";
    let pageTitle = "Dashboard";
    let showBackButton = true;

    // Map routes to their display titles
    const routeTitles: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'property-management': 'Property Management',
      'user-management': 'User Management',
      'role-management': 'Role Management',
      'permission-management': 'Permission Management',
      'role-permission-assignment': 'Role Permission Assignment',
      'profile': 'Profile',
      'notifications': 'Notifications'
    };

    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      pageTitle = routeTitles[lastSegment] || pageTitle;

      // Hide back button on main dashboard
      if (lastSegment === 'dashboard') {
        showBackButton = false;
      }
    }

    return { mainTitle, pageTitle, showBackButton };
  };

  const { mainTitle, pageTitle, showBackButton } = getPageInfo();

  return (
    <header className="border-b bg-background">
      <div className="relative flex h-12 md:h-16 items-center px-2 md:px-4 justify-between">
        {/* LEFT cluster (back) */}
        <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-accent h-7 w-7 md:h-10 md:w-10"
              aria-label="Go back"
            >
              <ChevronLeft className="h-3.5 w-3.5 md:h-5 md:w-5" />
            </Button>
          )}
        </div>

        {/* MOBILE title (centered) */}
        <div className="absolute inset-x-2 left-1/2 -translate-x-1/2 md:hidden
                    flex items-center justify-center gap-1 min-w-0 text-center">
          <h1 className="text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[60vw] leading-tight">
            {mainTitle}
          </h1>
          <span className="mx-1 text-[10px] text-muted-foreground">›</span>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[40vw] leading-tight">
            {pageTitle}
          </span>
        </div>

        {/* DESKTOP/TABLET title (normal, NOT centered) */}
        <div className="hidden md:flex items-center gap-2 min-w-0 flex-1">
          <h1 className="text-xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
            {mainTitle}
          </h1>
          <span className="mx-2 text-base text-muted-foreground">›</span>
          <span className="text-lg text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
            {pageTitle}
          </span>
        </div>

        {/* RIGHT cluster (theme + logout) */}
        <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-accent h-7 w-7 md:h-10 md:w-10"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-3.5 w-3.5 md:h-5 md:w-5" />
            ) : (
              <Sun className="h-3.5 w-3.5 md:h-5 md:w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            
            className="hover:bg-accent h-7 w-7 md:h-10 md:w-10"
            aria-label="Log out"
          >
            <LogOut className="h-3.5 w-3.5 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </header>

  );
};

export default TopHeader; 