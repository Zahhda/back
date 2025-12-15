import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LogOut,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ArrowLeft,
  Save,
  X,
  Shield,
  User
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { getActiveRoles, getRoleColors, Role } from "@/services/roleService";
import { API_URL } from '@/lib/constants';

interface UserStatus {
  value: string;
  label: string;
  colorClass: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  userType: string;
  roleId?: string;
  status: string;
  createdAt: string;

  // OPTIONAL shapes sometimes returned by APIs
  role?: { id?: string; _id?: string; name?: string } | string;
  roleName?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleColors, setRoleColors] = useState<{ [key: string]: string }>({});
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [statusOptions, setStatusOptions] = useState<UserStatus[]>([
    { value: 'active', label: 'Active', colorClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    { value: 'inactive', label: 'Inactive', colorClass: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
    { value: 'suspended', label: 'Suspended', colorClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
  ]);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
    userType: '',
    roleId: '',
    status: 'active'
  });
  const [editUser, setEditUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    userType: '',
    roleId: '',
    status: 'active'
  });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchUserStatuses();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobileNumber.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);
  // Map userType → likely role names you use in your system
  const USER_TYPE_TO_ROLE_NAMES: Record<string, string[]> = {
    property_listing: ['Owner', 'Property Owner', 'Lister'],
    property_searching: ['Tenant', 'Renter', 'Seeker'],
  };

  const DEFAULT_ROLE_CLASS = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  const findRoleByNames = (names: string[]) =>
    roles.find(r =>
      names.some(n =>
        r.name.toLowerCase() === n.toLowerCase() ||
        r.name.toLowerCase().includes(n.toLowerCase())
      )
    );

  const getRoleLabelForUser = (user: User): string => {
    // 1) roleId → roles[]
    if (user.roleId) {
      const r = roles.find(r => String(r.id) === String(user.roleId));
      if (r) return r.name;
    }

    // 2) role object/string or roleName string from backend
    const anyUser = user as any;
    const rawRoleId = anyUser.role?._id || anyUser.role?.id || (typeof anyUser.role === 'string' ? anyUser.role : undefined);
    if (rawRoleId) {
      const r = roles.find(r => String(r.id) === String(rawRoleId));
      if (r) return r.name;
    }
    if (anyUser.role?.name) return String(anyUser.role.name);
    if (anyUser.roleName) return String(anyUser.roleName);

    // 3) Infer from userType
    if (user.userType) {
      const names = USER_TYPE_TO_ROLE_NAMES[user.userType.toLowerCase()];
      if (names?.length) {
        const matched = findRoleByNames(names);
        if (matched) return matched.name;
        // Fall back to the first friendly label even if roles[] is empty
        return names[0];
      }
    }

    // 4) Nothing matched
    return 'No Role';
  };

  const getRoleClassForUser = (user: User): string => {
    // Try to get class from a concrete roles[] match first
    const label = getRoleLabelForUser(user).toLowerCase();
    const matched = roles.find(r => r.name.toLowerCase() === label);
    if (matched?.colorClass) return matched.colorClass;

    // Try name-based partial match to fetch a colorClass
    const partial = roles.find(r => r.name.toLowerCase().includes(label));
    if (partial?.colorClass) return partial.colorClass;

    // Otherwise neutral
    return DEFAULT_ROLE_CLASS;
  };

  const fetchUserStatuses = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await axios.get(`https://dorpay.in/api/user-statuses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && Array.isArray(response.data)) {
        setStatusOptions(response.data);
      }
    } catch (error) {
      console.error('Error fetching user statuses:', error);
      // Keep the default statuses if API fails
    }
  };

  const fetchRoles = async () => {
    try {
      setIsLoadingRoles(true);
      const activeRoles = await getActiveRoles();
      setRoles(activeRoles);

      // Get role colors
      const colors = await getRoleColors();
      setRoleColors(colors);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: "Error",
        description: "Failed to load user roles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const fetchUsers = async () => {
    console.log("API_URL is", API_URL);

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await axios.get(`https://dorpay.in/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (Array.isArray(response.data)) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        console.error("Unexpected user data format:", response.data);
        setUsers([]);
        setFilteredUsers([]);
      }

    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };



  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  };

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await axios.post(`https://dorpay.in/api/admin/users`, newUser, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUsers(prevUsers => [...prevUsers, response.data.user]);
      setIsAddDialogOpen(false);
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        password: '',
        userType: '',
        roleId: '',
        status: 'active'
      });

      // Show success message with email status
      if (response.data.emailSent) {
        toast({
          title: "Success",
          description: "User created successfully and welcome email sent with login credentials.",
        });
      } else {
        toast({
          title: "Partial Success",
          description: "User created successfully, but welcome email failed to send: " +
            (response.data.emailError || "Unknown error"),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await axios.put(`https://dorpay.in/api/admin/users/${selectedUser.id}`, editUser, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === selectedUser.id ? response.data : user
        )
      );
      setIsEditDialogOpen(false);

      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      await axios.delete(`https://dorpay.in/api/admin/users/${selectedUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUsers(prevUsers =>
        prevUsers.filter(user => user.id !== selectedUser.id)
      );
      setIsDeleteDialogOpen(false);

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      await axios.post(`https://dorpay.in/api/admin/users/${selectedUser.id}/reset-password`,
        { newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setIsResetPasswordDialogOpen(false);
      setNewPassword('');

      toast({
        title: "Success",
        description: "Password reset successfully",
      });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reset password",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      userType: user.userType,
      roleId: user.roleId || '',
      status: user.status
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const openResetPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsResetPasswordDialogOpen(true);
  };

  const getRoleName = (roleId: string | undefined) => {
    if (!roleId) return 'No Role';
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : "Unknown Role";
  };

  const getRoleColor = (roleId: string | undefined) => {
    if (!roleId) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'; // Default color
    const role = roles.find(r => r.id === roleId);
    return role?.colorClass || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption ? statusOption.colorClass : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusLabel = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.label || status;
  };

  const getRoleLabel = (roleId: string | undefined) => {
    if (!roleId) return 'No Role';
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'Unknown Role';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="">
          <div className="flex justify-between items-center mb-3 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-7 sm:pl-8 w-36 sm:w-[300px] h-8 sm:h-10 text-xs sm:text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Add User
            </Button>
          </div>



          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableCaption>
                {isLoading ? 'Loading users...' : `A list of all users (${filteredUsers.length})`}
              </TableCaption>
              <TableHeader>
                <TableRow className="*:[&>th]:px-2 *:[&>th]:py-2 sm:*:[&>th]:px-4 sm:*:[&>th]:py-3">
                  <TableHead className="w-[200px] text-xs sm:text-sm">Name</TableHead>
                  <TableHead className="text-xs sm:text-sm">Email</TableHead>
                  <TableHead className="text-xs sm:text-sm">Phone</TableHead>
                  <TableHead className="text-xs sm:text-sm">Role</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm">Created At</TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(filteredUsers) ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-red-500">
                      Error: User data is not in expected format.
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {searchTerm ? 'No users match your search criteria' : 'No users found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="text-xs sm:text-sm">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{user.email}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{user.mobileNumber}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant="outline" className={getRoleClassForUser(user)}>
                          {getRoleLabelForUser(user)}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant="outline" className={getStatusColor(user.status)}>
                          {getStatusLabel(user.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="space-x-1.5 inline-flex">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openViewDialog(user)}
                            aria-label="View user"
                            className="px-1.5 md:px-2"
                          >
                            <Eye className="h-2.5 w-2.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(user)}
                            aria-label="Edit user"
                            className="px-1.5 md:px-2"
                          >
                            <Edit2 className="h-2.5 w-2.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openResetPasswordDialog(user)}
                            aria-label="Reset password"
                            className="px-1.5 md:px-2"
                          >
                            <Shield className="h-2.5 w-2.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDeleteDialog(user)}
                            aria-label="Delete user"
                            className="px-1.5 md:px-2"
                          >
                            <Trash2 className="h-2.5 w-2.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />
                          </Button>
                        </div>

                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>


            </Table>
          </div>
        </div>
      </main>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[525px] px-4 sm:px-6 py-4 sm:py-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Add New User</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Create a new user account. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:gap-4 py-3 sm:py-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                value={newUser.mobileNumber}
                onChange={(e) => setNewUser({ ...newUser, mobileNumber: e.target.value })}
                placeholder="1234567890"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="roleId">User Role</Label>
                <Select
                  value={newUser.roleId}
                  onValueChange={(value) => setNewUser({ ...newUser, roleId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingRoles ? (
                      <div className="px-4 py-2 text-sm text-muted-foreground">Loading roles...</div>
                    ) : roles.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-muted-foreground">No roles available</div>
                    ) : (
                      roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>

                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newUser.status}
                  onValueChange={(value) => setNewUser({ ...newUser, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-muted-foreground">No status options available</div>
                    ) : (
                      statusOptions.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>

                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="submit" onClick={handleAddUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Leave fields unchanged if you don't want to modify them.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={editUser.firstName}
                  onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={editUser.lastName}
                  onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-mobileNumber">Mobile Number</Label>
              <Input
                id="edit-mobileNumber"
                value={editUser.mobileNumber}
                onChange={(e) => setEditUser({ ...editUser, mobileNumber: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-roleId">User Role</Label>
                <Select
                  value={editUser.roleId}
                  onValueChange={(value) => setEditUser({ ...editUser, roleId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingRoles ? (
                      <div className="px-4 py-2 text-sm text-muted-foreground">Loading roles...</div>
                    ) : roles.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-muted-foreground">No roles available</div>
                    ) : (
                      roles.map(role => (
                        <SelectItem
                          key={role.id}
                          value={role.id}
                          className="flex items-center"
                        >
                          <Badge className={role.colorClass || 'bg-gray-100 text-gray-800'} variant="outline">
                            {role.name}
                          </Badge>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>

                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editUser.status}
                  onValueChange={(value) => setEditUser({ ...editUser, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        No status options available
                      </div>
                    ) : (
                      statusOptions.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>

                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (selectedUser) {
                  openResetPasswordDialog(selectedUser);
                }
              }}
            >
              <Shield className="h-4 w-4 mr-2" />
              Reset Password
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleUpdateUser}>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="font-medium text-lg">{selectedUser.firstName} {selectedUser.lastName}</p>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className={getRoleColor(selectedUser.roleId)}>
                        {getRoleName(selectedUser.roleId)}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(selectedUser.status)}>
                        {getStatusLabel(selectedUser.status)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <CardTitle>{selectedUser.firstName} {selectedUser.lastName}</CardTitle>
                      <CardDescription>{selectedUser.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile Number</p>
                      <p>{selectedUser.mobileNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User Role</p>
                      <Badge className={getRoleClassForUser(selectedUser)}>
                        {getRoleLabelForUser(selectedUser)}
                      </Badge>

                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                      <Badge className={getStatusColor(selectedUser.status)}>
                        {getStatusLabel(selectedUser.status)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</p>
                      <p>{new Date(selectedUser.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button variant="outline" onClick={() => {
                    setIsViewDialogOpen(false);
                    if (selectedUser) {
                      openEditDialog(selectedUser);
                    }
                  }}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => {
                    setIsViewDialogOpen(false);
                    if (selectedUser) {
                      openDeleteDialog(selectedUser);
                    }
                  }}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'the user'}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleResetPassword}>
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement; 