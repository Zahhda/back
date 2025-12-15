import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Button } from './ui/button';
import { ArrowLeft, Home, LogOut, Menu } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

const AdminLayout: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" />;
  }
  
  // Redirect if user is not admin
  if (user.userType !== 'admin' && user.userType !== 'super_admin') {
    return <Navigate to="/dashboard" />;
  }

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };
  
  return (
    <div className="flex h-screen bg-background">
      {sidebarVisible && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b bg-background px-4 h-16">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="hover:bg-accent"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => window.history.back()}
                className="hover:bg-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="hover:bg-accent"
              >
                <Home className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">
                {location.pathname.split('/').pop()?.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-accent"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 