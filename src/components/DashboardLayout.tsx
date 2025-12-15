import React, { ReactNode, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import WelcomeBanner from './WelcomeBanner';
import TopHeader from './TopHeader';

interface DashboardLayoutProps {
  children?: ReactNode;
  requireAdmin?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  requireAdmin = false
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is not logged in, redirect to login page
    if (!loading && !user) {
      navigate("/auth/login");
    }
  }, [user, loading, navigate]);
  
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
  
  // Redirect if admin is required but user is not admin
  if (requireAdmin && user.userType !== 'admin' && user.userType !== 'super_admin') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="sticky top-0 z-50">
          <TopHeader />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Welcome Banner */}
          {/* <div className="mb-6">
            <WelcomeBanner />
          </div> */}
          
          {/* Outlet for nested routes */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 