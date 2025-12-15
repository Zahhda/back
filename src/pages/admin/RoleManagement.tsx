import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Table,
  TableBody,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Search,
  Shield,
  Users,
  Info,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  userCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description?: string;
}

// API URL from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Role Management Component
const RoleManagement = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [permissionsByModule, setPermissionsByModule] = useState<Record<string, Permission[]>>({});

  // Role form state
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissionIds: [] as string[],
  });

  // Check permissions
  useEffect(() => {
    if (!user || !hasPermission("roles", "view")) {
      navigate("/admin-fallback");
      toast.error("You don't have permission to access this page");
    }
  }, [user, hasPermission, navigate]);

  // Fetch roles and permissions
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch roles
        const rolesResponse = await axios.get(`${API_URL}/api/roles`);

        // Fetch permissions
        const permissionsResponse = await axios.get(`${API_URL}/api/permissions`);

        setRoles(rolesResponse.data);
        setAvailablePermissions(permissionsResponse.data);

        // Group permissions by module
        const groupedPermissions: Record<string, Permission[]> = {};
        permissionsResponse.data.forEach((permission: Permission) => {
          if (!groupedPermissions[permission.module]) {
            groupedPermissions[permission.module] = [];
          }
          groupedPermissions[permission.module].push(permission);
        });
        setPermissionsByModule(groupedPermissions);

      } catch (error) {
        console.error("Error fetching roles and permissions:", error);
        toast.error("Failed to load roles and permissions");

        // Generate mock data for development
        generateMockData();
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate mock data for development
  const generateMockData = () => {
    const mockPermissions: Permission[] = [
      { id: "1", name: "View Users", module: "users", action: "view" },
      { id: "2", name: "Create Users", module: "users", action: "create" },
      { id: "3", name: "Edit Users", module: "users", action: "edit" },
      { id: "4", name: "Delete Users", module: "users", action: "delete" },
      { id: "5", name: "View Roles", module: "roles", action: "view" },
      { id: "6", name: "Create Roles", module: "roles", action: "create" },
      { id: "7", name: "Edit Roles", module: "roles", action: "edit" },
      { id: "8", name: "Delete Roles", module: "roles", action: "delete" },
      { id: "9", name: "View Properties", module: "properties", action: "view" },
      { id: "10", name: "Approve Properties", module: "properties", action: "approve" },
      { id: "11", name: "Edit Properties", module: "properties", action: "edit" },
      { id: "12", name: "Delete Properties", module: "properties", action: "delete" },
      { id: "13", name: "View Dashboard", module: "dashboard", action: "view" },
      { id: "14", name: "View Reports", module: "reports", action: "view" },
      { id: "15", name: "View Settings", module: "settings", action: "view" },
      { id: "16", name: "Edit Settings", module: "settings", action: "edit" },
    ];

    const mockRoles: Role[] = [
      {
        id: "1",
        name: "Super Admin",
        description: "Full access to all system features",
        permissions: mockPermissions,
        userCount: 2,
        createdAt: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Property Manager",
        description: "Can manage property listings and approvals",
        permissions: mockPermissions.filter(p =>
          p.module === 'properties' ||
          (p.module === 'dashboard' && p.action === 'view')
        ),
        userCount: 8,
        createdAt: "2023-01-02T00:00:00Z",
      },
      {
        id: "3",
        name: "User Manager",
        description: "Can manage users and their accounts",
        permissions: mockPermissions.filter(p =>
          p.module === 'users' ||
          (p.module === 'dashboard' && p.action === 'view')
        ),
        userCount: 5,
        createdAt: "2023-01-03T00:00:00Z",
      },
      {
        id: "4",
        name: "Content Editor",
        description: "Can edit content but cannot delete",
        permissions: mockPermissions.filter(p =>
          p.action === 'view' || p.action === 'edit'
        ),
        userCount: 12,
        createdAt: "2023-01-04T00:00:00Z",
      },
      {
        id: "5",
        name: "Viewer",
        description: "Read-only access to the system",
        permissions: mockPermissions.filter(p => p.action === 'view'),
        userCount: 25,
        createdAt: "2023-01-05T00:00:00Z",
      },
    ];

    setAvailablePermissions(mockPermissions);
    setRoles(mockRoles);

    // Group permissions by module
    const groupedPermissions: Record<string, Permission[]> = {};
    mockPermissions.forEach((permission: Permission) => {
      if (!groupedPermissions[permission.module]) {
        groupedPermissions[permission.module] = [];
      }
      groupedPermissions[permission.module].push(permission);
    });
    setPermissionsByModule(groupedPermissions);
  };

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRoleForm({
      ...roleForm,
      [name]: value,
    });
  };

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string) => {
    setRoleForm((prev) => {
      const permissionIds = [...prev.permissionIds];

      if (permissionIds.includes(permissionId)) {
        return {
          ...prev,
          permissionIds: permissionIds.filter(id => id !== permissionId),
        };
      } else {
        return {
          ...prev,
          permissionIds: [...permissionIds, permissionId],
        };
      }
    });
  };

  // Handle module toggle (select/deselect all permissions in a module)
  const handleModuleToggle = (module: string, isChecked: boolean) => {
    const modulePermissionIds = permissionsByModule[module].map(p => p.id);

    setRoleForm((prev) => {
      let updatedPermissionIds = [...prev.permissionIds];

      if (isChecked) {
        // Add all module permissions that aren't already selected
        modulePermissionIds.forEach(id => {
          if (!updatedPermissionIds.includes(id)) {
            updatedPermissionIds.push(id);
          }
        });
      } else {
        // Remove all module permissions
        updatedPermissionIds = updatedPermissionIds.filter(
          id => !modulePermissionIds.includes(id)
        );
      }

      return {
        ...prev,
        permissionIds: updatedPermissionIds,
      };
    });
  };

  // Check if all permissions in a module are selected
  const isModuleFullySelected = (module: string) => {
    const modulePermissionIds = permissionsByModule[module].map(p => p.id);
    return modulePermissionIds.every(id => roleForm.permissionIds.includes(id));
  };

  // Check if some permissions in a module are selected
  const isModulePartiallySelected = (module: string) => {
    const modulePermissionIds = permissionsByModule[module].map(p => p.id);
    return modulePermissionIds.some(id => roleForm.permissionIds.includes(id)) &&
      !isModuleFullySelected(module);
  };

  // Reset role form
  const resetRoleForm = () => {
    setRoleForm({
      name: "",
      description: "",
      permissionIds: [],
    });
  };

  // Set up form for editing
  const setupEditForm = (role: Role) => {
    setCurrentRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissionIds: role.permissions.map(p => p.id),
    });
    setIsEditDialogOpen(true);
  };

  // Handle create role
  const handleCreateRole = async () => {
    try {
      const newRole = {
        name: roleForm.name,
        description: roleForm.description,
        permissionIds: roleForm.permissionIds,
      };

      // Make API call to create role
      const response = await axios.post(`${API_URL}/api/roles`, newRole);

      // Update local state
      const createdRole = response.data;
      setRoles([...roles, createdRole]);

      toast.success("Role created successfully");
      setIsAddDialogOpen(false);
      resetRoleForm();

    } catch (error) {
      console.error("Error creating role:", error);
      toast.error("Failed to create role");

      // For development: simulate successful creation
      if (import.meta.env.DEV) {
        const newRole: Role = {
          id: Date.now().toString(),
          name: roleForm.name,
          description: roleForm.description,
          permissions: availablePermissions.filter(p => roleForm.permissionIds.includes(p.id)),
          userCount: 0,
          createdAt: new Date().toISOString(),
        };

        setRoles([...roles, newRole]);
        toast.success("Role created successfully (Dev Mode)");
        setIsAddDialogOpen(false);
        resetRoleForm();
      }
    }
  };

  // Handle update role
  const handleUpdateRole = async () => {
    if (!currentRole) return;

    try {
      const updatedRole = {
        name: roleForm.name,
        description: roleForm.description,
        permissionIds: roleForm.permissionIds,
      };

      // Make API call to update role
      await axios.put(`${API_URL}/api/roles/${currentRole.id}`, updatedRole);

      // Update local state
      const updatedPermissions = availablePermissions.filter(p =>
        roleForm.permissionIds.includes(p.id)
      );

      setRoles(roles.map(role =>
        role.id === currentRole.id
          ? {
            ...role,
            name: roleForm.name,
            description: roleForm.description,
            permissions: updatedPermissions,
            updatedAt: new Date().toISOString(),
          }
          : role
      ));

      toast.success("Role updated successfully");
      setIsEditDialogOpen(false);
      setCurrentRole(null);
      resetRoleForm();

    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");

      // For development: simulate successful update
      if (import.meta.env.DEV) {
        const updatedPermissions = availablePermissions.filter(p =>
          roleForm.permissionIds.includes(p.id)
        );

        setRoles(roles.map(role =>
          role.id === currentRole.id
            ? {
              ...role,
              name: roleForm.name,
              description: roleForm.description,
              permissions: updatedPermissions,
              updatedAt: new Date().toISOString(),
            }
            : role
        ));

        toast.success("Role updated successfully (Dev Mode)");
        setIsEditDialogOpen(false);
        setCurrentRole(null);
        resetRoleForm();
      }
    }
  };

  // Handle delete role
  const handleDeleteRole = async (roleId: string) => {
    try {
      // Make API call to delete role
      await axios.delete(`${API_URL}/api/roles/${roleId}`);

      // Update local state
      setRoles(roles.filter(role => role.id !== roleId));

      toast.success("Role deleted successfully");

    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Failed to delete role");

      // For development: simulate successful deletion
      if (import.meta.env.DEV) {
        setRoles(roles.filter(role => role.id !== roleId));
        toast.success("Role deleted successfully (Dev Mode)");
      }
    }
  };

  // View role details
  const viewRoleDetails = (role: Role) => {
    setCurrentRole(role);
    setIsViewDialogOpen(true);
  };

  // Filter roles based on search query
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group permissions by module for display
  const groupPermissionsByModule = (permissions: Permission[]) => {
    const grouped: Record<string, Permission[]> = {};

    permissions.forEach(permission => {
      if (!grouped[permission.module]) {
        grouped[permission.module] = [];
      }
      grouped[permission.module].push(permission);
    });

    return grouped;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-4 md:mb-6">
        <div>
          <h1 className="text-lg md:text-2xl font-bold leading-tight">Role Management</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            Manage user roles and their permissions
          </p>
        </div>

        {hasPermission("roles", "create") && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 h-8 md:h-10 px-3 md:px-4 text-xs md:text-sm">
                <PlusCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Add New Role
              </Button>
            </DialogTrigger>

            {/* Mobile: near-full width & height; Desktop: unchanged */}
            <DialogContent className="w-[95vw] md:w-auto max-w-none md:max-w-3xl max-h-[85vh] md:max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base md:text-lg">Create New Role</DialogTitle>
                <DialogDescription className="text-xs md:text-sm">
                  Add a new role with specific permissions.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 md:gap-4 py-3 md:py-4">
                <div className="grid gap-1.5 md:gap-2">
                  <Label htmlFor="name" className="text-xs md:text-sm">Role Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter role name"
                    value={roleForm.name}
                    onChange={handleFormChange}
                    className="h-9 md:h-10 text-sm md:text-base"
                  />
                </div>

                <div className="grid gap-1.5 md:gap-2">
                  <Label htmlFor="description" className="text-xs md:text-sm">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the role's purpose and permissions"
                    value={roleForm.description}
                    onChange={handleFormChange}
                    rows={3}
                    className="text-sm md:text-base"
                  />
                </div>

                <div className="grid gap-2 mt-1 md:mt-2">
                  <Label className="text-xs md:text-sm">Permissions</Label>

                  <div className="border rounded-md p-3 md:p-4 max-h-[60vh] md:max-h-[300px] overflow-y-auto">
                    <Tabs defaultValue="byModule" className="w-full">
                      {/* Mobile: scrollable tabs if crowded */}
                      <TabsList className="mb-3 md:mb-4 overflow-x-auto whitespace-nowrap">
                        <TabsTrigger value="byModule" className="text-xs md:text-sm">By Module</TabsTrigger>
                        <TabsTrigger value="allPermissions" className="text-xs md:text-sm">All Permissions</TabsTrigger>
                      </TabsList>

                      <TabsContent value="byModule" className="space-y-3 md:space-y-4">
                        {Object.entries(permissionsByModule).map(([module, permissions]) => (
                          <div key={module} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`module-${module}`}
                                checked={isModuleFullySelected(module)}
                                onCheckedChange={(checked) => handleModuleToggle(module, checked === true)}
                                className={isModulePartiallySelected(module) ? "opacity-60" : ""}
                              />
                              <Label
                                htmlFor={`module-${module}`}
                                className="text-sm md:text-base font-medium capitalize"
                              >
                                {module}
                              </Label>
                            </div>

                            <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {permissions.map((permission) => (
                                <label
                                  key={permission.id}
                                  htmlFor={`permission-${permission.id}`}
                                  className="flex items-center gap-2 text-xs md:text-sm"
                                >
                                  <Checkbox
                                    id={`permission-${permission.id}`}
                                    checked={roleForm.permissionIds.includes(permission.id)}
                                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                                  />
                                  <span className="capitalize">
                                    {permission.action} {module}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="allPermissions">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {availablePermissions.map((permission) => (
                            <label
                              key={permission.id}
                              htmlFor={`all-permission-${permission.id}`}
                              className="flex items-center gap-2 text-xs md:text-sm"
                            >
                              <Checkbox
                                id={`all-permission-${permission.id}`}
                                checked={roleForm.permissionIds.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                              />
                              <span className="capitalize">
                                {permission.action} {permission.module}
                              </span>
                            </label>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 md:gap-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetRoleForm();
                  }}
                  className="h-9 md:h-10 px-3 md:px-4 text-sm md:text-base"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRole}
                  disabled={!roleForm.name || roleForm.permissionIds.length === 0}
                  className="h-9 md:h-10 px-4 md:px-5 text-sm md:text-base"
                >
                  Create Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>


      <div className="mb-4 md:mb-6">
        <div className="flex w-full max-w-full md:max-w-md items-center gap-2">
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 md:h-10 text-xs sm:text-sm md:text-base"
          />
          <Button
            variant="outline"
            type="submit"
            className="h-9 md:h-10 px-3 md:px-4"
          >
            <Search className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredRoles.length > 0 ? (
     <Card className="w-full md:w-auto">
  <CardContent className="p-0">
    <div className="overflow-x-auto md:overflow-visible">
      <Table className="text-xs md:text-sm min-w-[640px] md:min-w-0">
        <TableHeader>
          <TableRow className="*:[&>th]:px-2 *:[&>th]:py-1.5 md:*:[&>th]:px-4 md:*:[&>th]:py-3">
            <TableHead className="whitespace-nowrap">Role Name</TableHead>
            <TableHead className="whitespace-nowrap">Description</TableHead>
            <TableHead className="whitespace-nowrap">Permissions</TableHead>
            <TableHead className="whitespace-nowrap">Users</TableHead>
            <TableHead className="whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredRoles.map((role) => (
            <TableRow
              key={role.id}
              className="*:[&>td]:px-2 *:[&>td]:py-1.5 md:*:[&>td]:px-4 md:*:[&>td]:py-3 align-top"
            >
              <TableCell className="font-medium">{role.name}</TableCell>

              <TableCell className="max-w-[180px] md:max-w-[300px]">
                <span className="block truncate">{role.description}</span>
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-0.5 md:gap-1 max-w-[160px] md:max-w-[200px]">
                  {role.permissions.length > 3 ? (
                    <Badge
                      variant="outline"
                      className="cursor-pointer text-[10px] md:text-xs"
                      onClick={() => viewRoleDetails(role)}
                    >
                      {role.permissions.length} permissions
                    </Badge>
                  ) : (
                    role.permissions.map((permission) => (
                      <Badge
                        key={permission.id}
                        variant="outline"
                        className="capitalize text-[10px] md:text-xs"
                      >
                        {permission.action}
                      </Badge>
                    ))
                  )}
                </div>
              </TableCell>

              <TableCell>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 text-[10px] md:text-xs"
                >
                  <Users className="h-3 w-3 md:h-4 md:w-4" />
                  {role.userCount || 0}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1 md:gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => viewRoleDetails(role)}
                    title="View Details"
                    className="h-6 w-6 md:h-8 md:w-8"
                  >
                    <Info className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>

                  {hasPermission("roles", "edit") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setupEditForm(role)}
                      title="Edit Role"
                      className="h-6 w-6 md:h-8 md:w-8"
                    >
                      <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  )}

                  {hasPermission("roles", "delete") && role.name !== "Super Admin" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete Role"
                          className="h-6 w-6 md:h-8 md:w-8"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Role?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the "
                            {role.name}" role and remove it from all assigned users.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteRole(role.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </CardContent>
</Card>

      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/50 rounded-lg">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No roles found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try a different search term" : "Create a new role to get started"}
          </p>
        </div>
      )}

      {/* View Role Dialog */}
      {currentRole && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {currentRole.name}
              </DialogTitle>
              <DialogDescription>
                {currentRole.description}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Role Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Created</div>
                  <div>{new Date(currentRole.createdAt || "").toLocaleDateString()}</div>
                  {currentRole.updatedAt && (
                    <>
                      <div className="text-muted-foreground">Last Updated</div>
                      <div>{new Date(currentRole.updatedAt).toLocaleDateString()}</div>
                    </>
                  )}
                  <div className="text-muted-foreground">Assigned Users</div>
                  <div>{currentRole.userCount || 0}</div>
                  <div className="text-muted-foreground">Total Permissions</div>
                  <div>{currentRole.permissions.length}</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Permissions by Module</h4>
                <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                  {Object.entries(groupPermissionsByModule(currentRole.permissions)).map(
                    ([module, permissions]) => (
                      <div key={module} className="mb-4 last:mb-0">
                        <h5 className="text-sm font-medium capitalize mb-2">{module}</h5>
                        <div className="ml-4 flex flex-wrap gap-1">
                          {permissions.map((permission) => (
                            <Badge key={permission.id} variant="outline" className="capitalize">
                              {permission.action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <div className="flex gap-2">
                {hasPermission("roles", "edit") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setupEditForm(currentRole);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Role
                  </Button>
                )}
                <Button onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Role Dialog */}
      {currentRole && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Role: {currentRole.name}</DialogTitle>
              <DialogDescription>
                Update this role's details and permissions
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Role Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  placeholder="Enter role name"
                  value={roleForm.name}
                  onChange={handleFormChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  placeholder="Describe the role's purpose and permissions"
                  value={roleForm.description}
                  onChange={handleFormChange}
                  rows={3}
                />
              </div>

              <div className="grid gap-2 mt-2">
                <Label>Permissions</Label>
                <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                  <Tabs defaultValue="byModule" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="byModule">By Module</TabsTrigger>
                      <TabsTrigger value="allPermissions">All Permissions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="byModule" className="space-y-4">
                      {Object.entries(permissionsByModule).map(([module, permissions]) => (
                        <div key={module} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-module-${module}`}
                              checked={isModuleFullySelected(module)}
                              onCheckedChange={(checked) =>
                                handleModuleToggle(module, checked === true)
                              }
                              className={isModulePartiallySelected(module) ? "opacity-60" : ""}
                            />
                            <Label
                              htmlFor={`edit-module-${module}`}
                              className="text-base font-medium capitalize"
                            >
                              {module}
                            </Label>
                          </div>

                          <div className="ml-6 grid grid-cols-2 gap-2">
                            {permissions.map((permission) => (
                              <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`edit-permission-${permission.id}`}
                                  checked={roleForm.permissionIds.includes(permission.id)}
                                  onCheckedChange={() => handlePermissionToggle(permission.id)}
                                />
                                <Label
                                  htmlFor={`edit-permission-${permission.id}`}
                                  className="capitalize"
                                >
                                  {permission.action} {module}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="allPermissions">
                      <div className="grid grid-cols-2 gap-2">
                        {availablePermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-all-permission-${permission.id}`}
                              checked={roleForm.permissionIds.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                            <Label
                              htmlFor={`edit-all-permission-${permission.id}`}
                              className="capitalize"
                            >
                              {permission.action} {permission.module}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setCurrentRole(null);
                resetRoleForm();
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateRole}
                disabled={!roleForm.name || roleForm.permissionIds.length === 0}
              >
                Update Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RoleManagement; 