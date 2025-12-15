import axios from 'axios';
import { API_URL } from '@/lib/constants';

export interface Role {
  id: string;
  name: string;
  description: string;
  colorClass?: string;
  status: string;
  userCount?: number;
}

export interface RoleTypeMapping {
  [key: string]: string; // Maps role IDs to role names
}

export interface RoleWithCount extends Role {
  userCount: number;
}

/**
 * Fetches all roles from the backend
 * @returns Promise with list of roles
 */
export const getAllRoles = async (): Promise<Role[]> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await axios.get(`https://dorpay.in/api/roles`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

/**
 * Fetches a single role by ID
 * @param id Role ID
 * @returns Promise with role details
 */
export const getRoleById = async (id: string): Promise<Role> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await axios.get(`https://dorpay.in/api/roles/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching role:', error);
    throw error;
  }
};

/**
 * Fetches active roles for user type selection
 * @returns Promise with list of active roles
 */
export const getActiveRoles = async (): Promise<Role[]> => {
  try {
    const allRoles = await getAllRoles();
    return allRoles.filter(role => role.status === 'active');
  } catch (error) {
    console.error('Error fetching active roles:', error);
    throw error;
  }
};

/**
 * Creates a mapping of role IDs to role names
 * @returns Promise with role mapping object
 */
export const getRoleMapping = async (): Promise<RoleTypeMapping> => {
  try {
    const roles = await getAllRoles();
    const mapping: RoleTypeMapping = {};
    
    roles.forEach(role => {
      mapping[role.id] = role.name;
    });
    
    return mapping;
  } catch (error) {
    console.error('Error creating role mapping:', error);
    throw error;
  }
};

/**
 * Gets role colors based on data from database
 * @returns Object mapping role IDs to color classes
 */
export const getRoleColors = async (): Promise<{[key: string]: string}> => {
  try {
    const roles = await getActiveRoles();
    const roleColors: {[key: string]: string} = {};
    
    roles.forEach(role => {
      roleColors[role.name] = role.colorClass || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    });
    
    return roleColors;
  } catch (error) {
    console.error('Error fetching role colors:', error);
    // Return default colors in case of an error
    return {
      'Admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Manager': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Agent': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Client': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    };
  }
};

/**
 * Fetches all roles with their user counts
 * @returns Promise with list of roles including user counts
 */
export const getRolesWithUserCounts = async (): Promise<RoleWithCount[]> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await axios.get(`https://dorpay.in/api/roles/with-user-counts`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching roles with user counts:', error);
    throw error;
  }
}; 