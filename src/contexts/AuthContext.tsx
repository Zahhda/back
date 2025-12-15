import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define the User type
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  status: string;
  roles?: Role[];
  avatar?: string;
}

// Define the Role type
interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
}

// Define the Permission type
interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
}

// Define the context state
interface AuthContextState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  permissions: Record<string, boolean>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (module: string, action: string) => boolean;
  loadUserPermissions: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextState | undefined>(undefined);

// API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  // Initialize auth state from local storage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      console.log('AuthProvider initializing - Token exists:', !!storedToken);
      console.log('AuthProvider initializing - User exists:', !!storedUser);

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Parsed user from localStorage:', parsedUser);
          console.log('User type from localStorage:', parsedUser.userType);
          
          setToken(storedToken);
          setUser(parsedUser);
          await loadUserPermissions();
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Set up axios interceptors for authentication
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Function to load user's permissions
  const loadUserPermissions = async () => {
    if (!user || !token) return;

    try {
      // For admin users, we consider they have all permissions
      if (user.userType === 'admin') {
        try {
          const response = await axios.get(`${API_URL}/api/permissions`);
          const allPermissions: Record<string, boolean> = {};
          
          response.data.forEach((permission: Permission) => {
            const key = `${permission.module}_${permission.action}`;
            allPermissions[key] = true;
          });
          
          setPermissions(allPermissions);
          return;
        } catch (error) {
          console.error('Error loading all permissions:', error);
          // Fallback - we'll assume admin has all permissions
          setPermissions({ admin_all: true });
        }
      } else {
        // For non-admin users, load permissions from roles
        try {
          // Load user with roles and permissions
          const response = await axios.get(`${API_URL}/api/roles/user/${user.id}`);
          const userRoles: Role[] = response.data;
          
          // Update user with roles
          setUser(prevUser => ({
            ...prevUser!,
            roles: userRoles
          }));
          
          // Combine permissions from all roles
          const userPermissions: Record<string, boolean> = {};
          
          userRoles.forEach(role => {
            if (role.permissions) {
              role.permissions.forEach(permission => {
                const key = `${permission.module}_${permission.action}`;
                userPermissions[key] = true;
              });
            }
          });
          
          setPermissions(userPermissions);
        } catch (error) {
          console.error('Error loading user permissions:', error);
          setPermissions({});
        }
      }
    } catch (error) {
      console.error('Error in loadUserPermissions:', error);
      setPermissions({});
    }
  };

  // Check if user has a specific permission
  const hasPermission = (module: string, action: string): boolean => {
    // Admin and super_admin users have all permissions
    if (user?.userType === 'admin' || user?.userType === 'super_admin') return true;
    
    // Check if the permission exists in the permissions object
    const permissionKey = `${module}_${action}`;
    return !!permissions[permissionKey];
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      
      if (response.data.token) {
        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(newToken);
        setUser(userData);
        
        // Load user permissions after login
        await loadUserPermissions();
      } else {
        throw new Error('Login failed: No token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setPermissions({});
    // Redirect to login page will be handled by the protected routes
  };

  // Context value
  const contextValue: AuthContextState = {
    user,
    token,
    loading,
    error,
    permissions,
    login,
    logout,
    hasPermission,
    loadUserPermissions
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 