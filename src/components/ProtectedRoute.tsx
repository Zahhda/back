import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedUserTypes: string[];
  redirectPath?: string;
}

const ProtectedRoute = ({ 
  allowedUserTypes,
  redirectPath = '/auth/login' 
}: ProtectedRouteProps) => {
  // Get the user from localStorage
  const userString = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  // If there's no token or user, redirect to login
  if (!token || !userString) {
    return <Navigate to={redirectPath} replace />;
  }
  
  try {
    // Parse the user data
    const user = JSON.parse(userString);
    
    // Check if the user has the allowed role
    if (!user.userType || !allowedUserTypes.includes(user.userType)) {
      // Redirect to the appropriate dashboard based on user role
      if (user.userType === 'property_searching') {
        return <Navigate to="/dashboard/property-searching" replace />;
      } else if (user.userType === 'property_listing') {
        return <Navigate to="/dashboard/property-listing" replace />;
      } else if (user.userType === 'admin' || user.userType === 'super_admin') {
        return <Navigate to="/dashboard/admin" replace />;
      } else {
        // If the user type is unknown, redirect to login
        return <Navigate to={redirectPath} replace />;
      }
    }
    
    // If the user is allowed, render the children
    return <Outlet />;
  } catch (error) {
    // If there's an error parsing the user data, redirect to login
    return <Navigate to={redirectPath} replace />;
  }
};

export default ProtectedRoute; 