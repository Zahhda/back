import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRightLeft,
  Filter,
  Check,
  Lock,
  AlertCircle,
  Save,
  Loader2,
  Search
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Types
interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description?: string;
  isSystemPermission?: boolean;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystemRole?: boolean;
  permissions?: string[]; // Array of permission IDs
}

// API URL from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// RolePermissionAssignment Component
const RolePermissionAssignment = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modules, setModules] = useState<string[]>([]);
  const [filterModule, setFilterModule] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [originalPermissions, setOriginalPermissions] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  // Check permissions
  useEffect(() => {
    if (!user || !hasPermission("roles", "edit")) {
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
        const rolesResponse = await axios.get(`${API_URL}/roles`);

        // Fetch permissions
        const permissionsResponse = await axios.get(`${API_URL}/permissions`);

        setRoles(rolesResponse.data);
        setPermissions(permissionsResponse.data);

        // Extract unique modules
        const modulesList = Array.from(
          new Set(permissionsResponse.data.map((p: Permission) => p.module))
        ).sort() as string[];

        setModules(modulesList);

      } catch (error) {
        console.error("Error fetching data:", error);
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
      { id: "1", name: "View Users", module: "users", action: "view", description: "Can view users in the system" },
      { id: "2", name: "Create Users", module: "users", action: "create", description: "Can create new user accounts" },
      { id: "3", name: "Edit Users", module: "users", action: "edit", description: "Can modify existing user accounts" },
      { id: "4", name: "Delete Users", module: "users", action: "delete", description: "Can remove user accounts", isSystemPermission: true },
      { id: "5", name: "View Roles", module: "roles", action: "view", description: "Can view roles in the system" },
      { id: "6", name: "Create Roles", module: "roles", action: "create", description: "Can create new roles" },
      { id: "7", name: "Edit Roles", module: "roles", action: "edit", description: "Can modify existing roles" },
      { id: "8", name: "Delete Roles", module: "roles", action: "delete", description: "Can remove roles from the system", isSystemPermission: true },
      { id: "9", name: "View Properties", module: "properties", action: "view", description: "Can view property listings" },
      { id: "10", name: "Approve Properties", module: "properties", action: "approve", description: "Can approve property listings" },
      { id: "11", name: "Edit Properties", module: "properties", action: "edit", description: "Can edit property details" },
      { id: "12", name: "Delete Properties", module: "properties", action: "delete", description: "Can remove property listings" },
      { id: "13", name: "View Dashboard", module: "dashboard", action: "view", description: "Can access dashboard" },
      { id: "14", name: "View Reports", module: "reports", action: "view", description: "Can view system reports" },
      { id: "15", name: "Export Reports", module: "reports", action: "export", description: "Can export system reports" },
      { id: "16", name: "View Settings", module: "settings", action: "view", description: "Can view system settings" },
      { id: "17", name: "Edit Settings", module: "settings", action: "edit", description: "Can modify system settings", isSystemPermission: true },
      { id: "18", name: "View Permissions", module: "permissions", action: "view", description: "Can view permissions in the system" },
      { id: "19", name: "Create Permissions", module: "permissions", action: "create", description: "Can create new permissions" },
      { id: "20", name: "Edit Permissions", module: "permissions", action: "edit", description: "Can edit permissions" },
      { id: "21", name: "Delete Permissions", module: "permissions", action: "delete", description: "Can delete permissions", isSystemPermission: true },
    ];

    const mockRoles: Role[] = [
      {
        id: "1",
        name: "Super Admin",
        description: "Full access to all system features",
        isSystemRole: true,
        permissions: mockPermissions.map(p => p.id)
      },
      {
        id: "2",
        name: "Admin",
        description: "Administrative access with some restrictions",
        permissions: ["1", "2", "3", "5", "6", "7", "9", "10", "11", "12", "13", "14", "15", "16", "18", "19", "20"]
      },
      {
        id: "3",
        name: "Property Manager",
        description: "Can manage property listings",
        permissions: ["1", "5", "9", "10", "11", "12", "13"]
      },
      {
        id: "4",
        name: "Agent",
        description: "Can create and manage their own listings",
        permissions: ["9", "11", "13"]
      },
      {
        id: "5",
        name: "User",
        description: "Regular user with limited access",
        permissions: ["9", "13"]
      },
    ];

    setPermissions(mockPermissions);
    setRoles(mockRoles);

    // Extract unique modules
    const modulesList = Array.from(
      new Set(mockPermissions.map(p => p.module))
    ).sort() as string[];

    setModules(modulesList);
  };

  // Handle role selection
  const handleRoleSelect = (roleId: string) => {
    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Do you want to discard them?")) {
        loadRolePermissions(roleId);
      }
    } else {
      loadRolePermissions(roleId);
    }
  };

  // Load permissions for selected role
  const loadRolePermissions = (roleId: string) => {
    setSelectedRoleId(roleId);

    const role = roles.find(r => r.id === roleId);
    setSelectedRole(role || null);

    if (role && role.permissions) {
      const permissionSet = new Set(role.permissions);
      setSelectedPermissions(permissionSet);
      setOriginalPermissions(new Set(role.permissions));
      setHasChanges(false);
    } else {
      setSelectedPermissions(new Set());
      setOriginalPermissions(new Set());
      setHasChanges(false);
    }
  };

  // Toggle permission selection
  const togglePermission = (permissionId: string) => {
    const newSelectedPermissions = new Set(selectedPermissions);

    if (newSelectedPermissions.has(permissionId)) {
      newSelectedPermissions.delete(permissionId);
    } else {
      newSelectedPermissions.add(permissionId);
    }

    setSelectedPermissions(newSelectedPermissions);

    // Check if there are changes
    const originalPermissionsArray = Array.from(originalPermissions);
    const newSelectedPermissionsArray = Array.from(newSelectedPermissions);

    const hasAddedPermissions = newSelectedPermissionsArray.some(p => !originalPermissionsArray.includes(p));
    const hasRemovedPermissions = originalPermissionsArray.some(p => !newSelectedPermissionsArray.includes(p));

    setHasChanges(hasAddedPermissions || hasRemovedPermissions);
  };

  // Toggle all permissions in a module
  const toggleModulePermissions = (module: string, selectAll: boolean) => {
    const modulePermissions = permissions.filter(p => p.module === module);
    const modulePermissionIds = modulePermissions.map(p => p.id);

    const newSelectedPermissions = new Set(selectedPermissions);

    modulePermissionIds.forEach(id => {
      if (selectAll) {
        newSelectedPermissions.add(id);
      } else {
        newSelectedPermissions.delete(id);
      }
    });

    setSelectedPermissions(newSelectedPermissions);

    // Check if there are changes
    const originalPermissionsArray = Array.from(originalPermissions);
    const newSelectedPermissionsArray = Array.from(newSelectedPermissions);

    const hasAddedPermissions = newSelectedPermissionsArray.some(p => !originalPermissionsArray.includes(p));
    const hasRemovedPermissions = originalPermissionsArray.some(p => !newSelectedPermissionsArray.includes(p));

    setHasChanges(hasAddedPermissions || hasRemovedPermissions);
  };

  // Save permissions for the selected role
  const saveRolePermissions = async () => {
    if (!selectedRole) return;

    // Prevent editing system roles
    if (selectedRole.isSystemRole) {
      toast.error("System roles cannot be modified");
      return;
    }

    setIsSaving(true);

    try {
      const updatedRole = {
        ...selectedRole,
        permissions: Array.from(selectedPermissions),
      };

      // Make API call to update role permissions
      await axios.put(`${API_URL}/roles/${selectedRole.id}/permissions`, {
        permissions: Array.from(selectedPermissions),
      });

      // Update local state
      setRoles(roles.map(role =>
        role.id === selectedRole.id
          ? updatedRole
          : role
      ));

      // Update original permissions
      setOriginalPermissions(new Set(selectedPermissions));
      setHasChanges(false);

      toast.success(`Permissions updated for ${selectedRole.name}`);

    } catch (error) {
      console.error("Error updating role permissions:", error);
      toast.error("Failed to update role permissions");

      // For development: simulate successful update
      if (import.meta.env.DEV) {
        const updatedRole = {
          ...selectedRole,
          permissions: Array.from(selectedPermissions),
        };

        // Update local state
        setRoles(roles.map(role =>
          role.id === selectedRole.id
            ? updatedRole
            : role
        ));

        // Update original permissions
        setOriginalPermissions(new Set(selectedPermissions));
        setHasChanges(false);

        toast.success(`Permissions updated for ${selectedRole.name} (Dev Mode)`);
      }

    } finally {
      setIsSaving(false);
    }
  };

  // Calculate if all permissions in a module are selected
  const areAllModulePermissionsSelected = (module: string) => {
    const modulePermissions = permissions.filter(p => p.module === module);
    return modulePermissions.every(p => selectedPermissions.has(p.id));
  };

  // Calculate if some but not all permissions in a module are selected
  const areSomeModulePermissionsSelected = (module: string) => {
    const modulePermissions = permissions.filter(p => p.module === module);
    const selectedCount = modulePermissions.filter(p => selectedPermissions.has(p.id)).length;
    return selectedCount > 0 && selectedCount < modulePermissions.length;
  };

  // Get filtered permissions based on search and module filter
  const getFilteredPermissions = () => {
    return permissions.filter(permission => {
      const matchesSearch =
        permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        permission.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
        permission.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (permission.description && permission.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesModule = filterModule === "all" || permission.module === filterModule;

      return matchesSearch && matchesModule;
    });
  };

  // Group permissions by module
  const getPermissionsByModule = () => {
    const filteredPermissions = getFilteredPermissions();
    const groupedPermissions: Record<string, Permission[]> = {};

    filteredPermissions.forEach(permission => {
      if (!groupedPermissions[permission.module]) {
        groupedPermissions[permission.module] = [];
      }
      groupedPermissions[permission.module].push(permission);
    });

    return groupedPermissions;
  };

  const permissionsByModule = getPermissionsByModule();
  const activeModules = Object.keys(permissionsByModule).sort();

  return (
    <div className="container mx-auto px-3 md:px-0 py-4 md:py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-4 md:mb-6">
        <div>
          <h1 className="text-lg md:text-2xl font-bold leading-tight">
            Role-Permission Assignment
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            Manage permissions assigned to each role
          </p>
        </div>
      </div>

      {/* Layout grid */}
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 md:gap-6">
        {/* Left: roles list */}
        <Card className="h-min">
          <CardHeader className="py-3 md:py-4">
            <CardTitle className="text-base md:text-lg">Roles</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Select a role to manage its permissions
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : roles.length > 0 ? (
              <div className="space-y-2">
                {roles.map(role => (
                  <Button
                    key={role.id}
                    variant={selectedRoleId === role.id ? "default" : "outline"}
                    className="w-full justify-start text-left h-9 md:h-10 text-xs sm:text-sm md:text-base"
                    onClick={() => handleRoleSelect(role.id)}
                  >
                    <div className="flex items-center min-w-0">
                      {role.isSystemRole && (
                        <Lock className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2 text-amber-500 shrink-0" />
                      )}
                      <div className="truncate">
                        {role.name}
                        {role.isSystemRole && (
                          <span className="ml-2 text-[10px] md:text-xs text-muted-foreground">
                            (System Role)
                          </span>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground mb-2" />
                <h3 className="text-sm md:text-base font-medium">No roles found</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Please create roles first
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: details */}
        <div>
          <Card className="mb-4 md:mb-6">
            <CardHeader className="pb-2 md:pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                <div>
                  <CardTitle className="text-base md:text-lg">
                    {selectedRole ? selectedRole.name : "Select a role"}
                  </CardTitle>
                  {selectedRole && (
                    <CardDescription className="text-xs md:text-sm">
                      {selectedRole.description || "No description available"}
                    </CardDescription>
                  )}
                </div>

                {selectedRole && (
                  <Button
                    onClick={saveRolePermissions}
                    disabled={!hasChanges || isSaving || selectedRole.isSystemRole}
                    className="gap-2 h-9 md:h-10 px-3 md:px-4 text-sm md:text-base self-end md:self-auto"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {selectedRole ? (
                <div className="space-y-3 md:space-y-4">
                  {selectedRole.isSystemRole && (
                    <div className="bg-amber-50 text-amber-800 px-3 md:px-4 py-2.5 md:py-3 rounded-md flex items-start gap-2.5 md:gap-3 border border-amber-200 text-xs md:text-sm">
                      <Lock className="h-4 w-4 md:h-5 md:w-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">System Role</p>
                        <p>
                          This is a system-defined role with pre-assigned permissions.
                          It cannot be modified to ensure system integrity.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Filters row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-4 flex-wrap">
                    <div className="flex w-full sm:w-auto items-center gap-2">
                      <div className="relative w-full max-w-none sm:max-w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search permissions..."
                          className="pl-8 h-9 md:h-10 text-sm md:text-base"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          disabled={selectedRole.isSystemRole}
                        />
                      </div>

                      <Select
                        value={filterModule}
                        onValueChange={setFilterModule}
                        disabled={selectedRole.isSystemRole}
                      >
                        <SelectTrigger className="w-[150px] md:w-[180px] h-9 md:h-10 text-sm md:text-base">
                          <div className="flex items-center">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by module" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Modules</SelectItem>
                          {modules.map((module) => (
                            <SelectItem key={module} value={module}>
                              {module.charAt(0).toUpperCase() + module.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-1 text-xs md:text-sm">
                      <Badge variant="outline" className="bg-primary/5 border-primary/20">
                        {Array.from(selectedPermissions).length} permissions selected
                      </Badge>
                      {hasChanges && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Unsaved changes
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Permissions list */}
                  {activeModules.length > 0 ? (
                    <ScrollArea className="h-[calc(100vh-380px)] md:h-[calc(100vh-400px)] pr-3 md:pr-4">
                      <Accordion type="multiple" className="w-full" defaultValue={activeModules}>
                        {activeModules.map((module) => (
                          <AccordionItem key={module} value={module}>
                            <AccordionTrigger className="py-3 md:py-4">
                              <div className="flex flex-col md:flex-row md:items-center md:gap-3 w-full">
                                <div className="flex-1 flex items-center">
                                  <Badge variant="outline" className="mr-2 capitalize text-[10px] md:text-xs">
                                    {module}
                                  </Badge>
                                  <span className="text-xs md:text-sm text-muted-foreground">
                                    ({permissionsByModule[module].length} permissions)
                                  </span>
                                </div>

                                {!selectedRole.isSystemRole && (
                                  <div
                                    className="flex items-center gap-1.5 md:gap-2 md:mr-4 mt-2 md:mt-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-[11px] md:text-xs h-7 px-2"
                                      onClick={() => toggleModulePermissions(module, true)}
                                    >
                                      Select All
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-[11px] md:text-xs h-7 px-2"
                                      onClick={() => toggleModulePermissions(module, false)}
                                    >
                                      Deselect All
                                    </Button>
                                  </div>
                                )}

                                <div
                                  className="flex items-center ml-auto md:ml-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="h-4 w-4 relative">
                                          <Checkbox
                                            className={areSomeModulePermissionsSelected(module) ? "opacity-40" : ""}
                                            id={`select-all-${module}`}
                                            checked={areAllModulePermissionsSelected(module)}
                                            disabled={selectedRole.isSystemRole}
                                            onCheckedChange={(checked) =>
                                              toggleModulePermissions(module, checked === true)
                                            }
                                          />
                                          {areSomeModulePermissionsSelected(module) && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                              <div className="h-[6px] w-[6px] bg-primary rounded-sm" />
                                            </div>
                                          )}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="text-xs md:text-sm">
                                        {areAllModulePermissionsSelected(module)
                                          ? "Deselect all permissions in this module"
                                          : areSomeModulePermissionsSelected(module)
                                            ? "Some permissions selected"
                                            : "Select all permissions in this module"}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </AccordionTrigger>

                            <AccordionContent>
                              <div className="space-y-1.5 md:space-y-2 pl-2">
                                {permissionsByModule[module].map((permission) => (
                                  <div key={permission.id} className="flex items-center gap-2 py-1">
                                    <Checkbox
                                      id={`permission-${permission.id}`}
                                      checked={selectedPermissions.has(permission.id)}
                                      disabled={selectedRole.isSystemRole}
                                      onCheckedChange={() => togglePermission(permission.id)}
                                    />
                                    <div className="grid gap-0.5">
                                      <Label
                                        htmlFor={`permission-${permission.id}`}
                                        className="cursor-pointer flex items-center text-sm md:text-base"
                                      >
                                        {permission.isSystemPermission && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Lock className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5 text-amber-500" />
                                              </TooltipTrigger>
                                              <TooltipContent className="text-xs md:text-sm">
                                                <p>System permission</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                        {permission.name}
                                        <Badge
                                          className="ml-2 capitalize bg-primary/10 text-primary border-primary/20 text-[10px] md:text-xs"
                                          variant="outline"
                                        >
                                          {permission.action}
                                        </Badge>
                                      </Label>
                                      <p className="text-[11px]  text-muted-foreground pl-0.5 text-xs sm:text-sm md:text-base">
                                        {permission.description || "No description available"}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <AlertCircle className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-3" />
                      <h3 className="text-base md:text-lg font-medium">No permissions match your filters</h3>
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ArrowRightLeft className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-3" />
                  <h3 className="text-base md:text-lg font-medium">No role selected</h3>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-sm">
                    Select a role from the sidebar to manage its permissions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

  );
};

export default RolePermissionAssignment; 