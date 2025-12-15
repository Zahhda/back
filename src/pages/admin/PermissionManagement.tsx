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
  Plus,
  Pencil,
  Lock,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  isSystemPermission?: boolean;
}

// API URL from environment
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_URL = import.meta.env.VITE_API_URL || "https://dorpay.in";

// Permission Management Component
const PermissionManagement = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPermission, setCurrentPermission] = useState<Permission | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [filterModule, setFilterModule] = useState<string>("all");
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [availableActions, setAvailableActions] = useState<string[]>([
    "view", "create", "edit", "delete", "approve", "reject", "export", "import"
  ]);

  // Permission form state
  const [permissionForm, setPermissionForm] = useState({
    name: "",
    module: "",
    action: "",
    description: "",
    isNewModule: false,
    newModule: "",
  });

  // Check permissions
  useEffect(() => {
    if (!user || !hasPermission("permissions", "view")) {
      navigate("/admin-fallback");
      toast.error("You don't have permission to access this page");
    }
  }, [user, hasPermission, navigate]);

  // Fetch permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      setIsLoading(true);
      try {
        // Fetch permissions
        const response = await axios.get(`${API_URL}/permissions`);
        
        setPermissions(response.data);
        
        // Extract unique modules
        const modules = Array.from(
          new Set(response.data.map((p: Permission) => p.module))
        ).sort() as string[];
        
        setAvailableModules(modules);
        
      } catch (error) {
        console.error("Error fetching permissions:", error);
        toast.error("Failed to load permissions");
        
        // Generate mock data for development
        generateMockData();
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
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
    ];

    setPermissions(mockPermissions);
    
    // Extract unique modules
    const modules = Array.from(
      new Set(mockPermissions.map(p => p.module))
    ).sort();
    
    setAvailableModules(modules);
  };

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPermissionForm({
      ...permissionForm,
      [name]: value,
    });
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setPermissionForm({
      ...permissionForm,
      [name]: value,
    });

    // Auto-generate name based on module and action
    if (name === 'module' || name === 'action') {
      const module = name === 'module' ? value : permissionForm.module;
      const action = name === 'action' ? value : permissionForm.action;
      
      if (module && action) {
        setPermissionForm(prev => ({
          ...prev,
          [name]: value,
          name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module.charAt(0).toUpperCase() + module.slice(1)}`,
        }));
      }
    }
  };

  // Toggle new module input
  const toggleNewModuleInput = (isNewModule: boolean) => {
    setPermissionForm({
      ...permissionForm,
      isNewModule,
      module: isNewModule ? "" : permissionForm.module,
    });
  };

  // Reset permission form
  const resetPermissionForm = () => {
    setPermissionForm({
      name: "",
      module: "",
      action: "",
      description: "",
      isNewModule: false,
      newModule: "",
    });
  };

  // Set up form for editing
  const setupEditForm = (permission: Permission) => {
    setCurrentPermission(permission);
    setPermissionForm({
      name: permission.name,
      module: permission.module,
      action: permission.action,
      description: permission.description || "",
      isNewModule: false,
      newModule: "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle create permission
  const handleCreatePermission = async () => {
    try {
      const newPermission = {
        name: permissionForm.name,
        module: permissionForm.isNewModule ? permissionForm.newModule.toLowerCase() : permissionForm.module,
        action: permissionForm.action,
        description: permissionForm.description,
      };

      // Check if permission already exists
      const exists = permissions.some(
        p => p.module === newPermission.module && p.action === newPermission.action
      );
      
      if (exists) {
        toast.error(`Permission ${newPermission.action} ${newPermission.module} already exists`);
        return;
      }

      // Make API call to create permission
      const response = await axios.post(`${API_URL}/permissions`, newPermission);
      
      // Update local state
      const createdPermission = response.data;
      setPermissions([...permissions, createdPermission]);
      
      // Update modules list if new module added
      if (permissionForm.isNewModule && !availableModules.includes(newPermission.module)) {
        setAvailableModules([...availableModules, newPermission.module].sort());
      }
      
      toast.success("Permission created successfully");
      setIsAddDialogOpen(false);
      resetPermissionForm();
      
    } catch (error) {
      console.error("Error creating permission:", error);
      toast.error("Failed to create permission");
      
      // For development: simulate successful creation
      if (import.meta.env.DEV) {
        const module = permissionForm.isNewModule 
          ? permissionForm.newModule.toLowerCase() 
          : permissionForm.module;
        
        const newPermission: Permission = {
          id: Date.now().toString(),
          name: permissionForm.name,
          module,
          action: permissionForm.action,
          description: permissionForm.description,
          createdAt: new Date().toISOString(),
        };
        
        setPermissions([...permissions, newPermission]);
        
        // Update modules list if new module added
        if (permissionForm.isNewModule && !availableModules.includes(module)) {
          setAvailableModules([...availableModules, module].sort());
        }
        
        toast.success("Permission created successfully (Dev Mode)");
        setIsAddDialogOpen(false);
        resetPermissionForm();
      }
    }
  };

  // Handle update permission
  const handleUpdatePermission = async () => {
    if (!currentPermission) return;
    
    try {
      // Prevent editing system permissions
      if (currentPermission.isSystemPermission) {
        toast.error("System permissions cannot be modified");
        return;
      }
      
      const updatedPermission = {
        name: permissionForm.name,
        module: permissionForm.isNewModule ? permissionForm.newModule.toLowerCase() : permissionForm.module,
        action: permissionForm.action,
        description: permissionForm.description,
      };

      // Check if permission already exists (except current one)
      const exists = permissions.some(
        p => p.id !== currentPermission.id && 
             p.module === updatedPermission.module && 
             p.action === updatedPermission.action
      );
      
      if (exists) {
        toast.error(`Permission ${updatedPermission.action} ${updatedPermission.module} already exists`);
        return;
      }

      // Make API call to update permission
      await axios.put(`${API_URL}/permissions/${currentPermission.id}`, updatedPermission);
      
      // Update local state
      setPermissions(permissions.map(permission => 
        permission.id === currentPermission.id
          ? {
              ...permission,
              ...updatedPermission,
              updatedAt: new Date().toISOString(),
            }
          : permission
      ));
      
      // Update modules list if new module added
      if (permissionForm.isNewModule && !availableModules.includes(updatedPermission.module)) {
        setAvailableModules([...availableModules, updatedPermission.module].sort());
      }
      
      toast.success("Permission updated successfully");
      setIsEditDialogOpen(false);
      setCurrentPermission(null);
      resetPermissionForm();
      
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error("Failed to update permission");
      
      // For development: simulate successful update
      if (import.meta.env.DEV) {
        const module = permissionForm.isNewModule 
          ? permissionForm.newModule.toLowerCase() 
          : permissionForm.module;
          
        setPermissions(permissions.map(permission => 
          permission.id === currentPermission.id
            ? {
                ...permission,
                name: permissionForm.name,
                module,
                action: permissionForm.action,
                description: permissionForm.description,
                updatedAt: new Date().toISOString(),
              }
            : permission
        ));
        
        // Update modules list if new module added
        if (permissionForm.isNewModule && !availableModules.includes(module)) {
          setAvailableModules([...availableModules, module].sort());
        }
        
        toast.success("Permission updated successfully (Dev Mode)");
        setIsEditDialogOpen(false);
        setCurrentPermission(null);
        resetPermissionForm();
      }
    }
  };

  // Handle delete permission
  const handleDeletePermission = async (permissionId: string) => {
    // Find the permission
    const permissionToDelete = permissions.find(p => p.id === permissionId);
    
    if (!permissionToDelete) return;
    
    // Prevent deleting system permissions
    if (permissionToDelete.isSystemPermission) {
      toast.error("System permissions cannot be deleted");
      return;
    }
    
    try {
      // Make API call to delete permission
      await axios.delete(`${API_URL}/permissions/${permissionId}`);
      
      // Update local state
      setPermissions(permissions.filter(permission => permission.id !== permissionId));
      
      toast.success("Permission deleted successfully");
      
    } catch (error) {
      console.error("Error deleting permission:", error);
      toast.error("Failed to delete permission");
      
      // For development: simulate successful deletion
      if (import.meta.env.DEV) {
        setPermissions(permissions.filter(permission => permission.id !== permissionId));
        toast.success("Permission deleted successfully (Dev Mode)");
      }
    }
  };

  // View permission details
  const viewPermissionDetails = (permission: Permission) => {
    setCurrentPermission(permission);
    setIsViewDialogOpen(true);
  };

  // Filter permissions based on search query and module filter
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = 
      permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (permission.description && permission.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesModuleFilter = filterModule === "all" || permission.module === filterModule;
    
    return matchesSearch && matchesModuleFilter;
  });

  // Get module-based permissions
  const getModulePermissionCounts = () => {
    const counts: Record<string, number> = {};
    
    permissions.forEach(permission => {
      if (!counts[permission.module]) {
        counts[permission.module] = 0;
      }
      counts[permission.module]++;
    });
    
    return counts;
  };

  const modulePermissionCounts = getModulePermissionCounts();

  return (
    <div className="container mx-auto px-3 md:px-0 py-4 md:py-6">
  {/* Header */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-4 md:mb-6">
    <div>
      <h1 className="text-lg md:text-2xl font-bold leading-tight">Permission Management</h1>
      <p className="text-xs md:text-base text-muted-foreground">
        Define and manage system permissions
      </p>
    </div>

    {hasPermission("permissions", "create") && (
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 h-9 md:h-10 px-3 md:px-4 text-sm md:text-base">
            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Add Permission
          </Button>
        </DialogTrigger>

        {/* Dialogs: near full width on mobile; same on desktop */}
        <DialogContent className="w-[95vw] md:w-auto max-w-none md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Create New Permission</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Define a new permission for system access control.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 md:gap-4 py-3 md:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="grid gap-1.5 md:gap-2">
                <Label htmlFor="module" className="text-xs md:text-sm">Module</Label>

                {permissionForm.isNewModule ? (
                  <div className="grid gap-1.5 md:gap-2">
                    <Input
                      id="newModule"
                      name="newModule"
                      placeholder="Enter new module name"
                      value={permissionForm.newModule}
                      onChange={handleFormChange}
                      className="h-9 md:h-10 text-sm md:text-base"
                    />
                    <Button
                      variant="link"
                      className="justify-start px-0 text-xs md:text-sm"
                      onClick={() => toggleNewModuleInput(false)}
                    >
                      Select existing module
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-1.5 md:gap-2">
                    <Select
                      value={permissionForm.module}
                      onValueChange={(value) => handleSelectChange('module', value)}
                    >
                      <SelectTrigger className="h-9 md:h-10 text-sm md:text-base">
                        <SelectValue placeholder="Select a module" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModules.map((module) => (
                          <SelectItem key={module} value={module}>
                            {module.charAt(0).toUpperCase() + module.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="link"
                      className="justify-start px-0 text-xs md:text-sm"
                      onClick={() => toggleNewModuleInput(true)}
                    >
                      Add new module
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-1.5 md:gap-2">
                <Label htmlFor="action" className="text-xs md:text-sm">Action</Label>
                <Select
                  value={permissionForm.action}
                  onValueChange={(value) => handleSelectChange('action', value)}
                >
                  <SelectTrigger className="h-9 md:h-10 text-sm md:text-base">
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5 md:gap-2">
              <Label htmlFor="name" className="text-xs md:text-sm">Permission Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter permission name"
                value={permissionForm.name}
                onChange={handleFormChange}
                className="h-9 md:h-10 text-sm md:text-base"
              />
            </div>

            <div className="grid gap-1.5 md:gap-2">
              <Label htmlFor="description" className="text-xs md:text-sm">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Briefly describe what this permission allows"
                value={permissionForm.description}
                onChange={handleFormChange}
                rows={3}
                className="text-sm md:text-base"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 md:gap-0">
            <Button
              variant="outline"
              onClick={() => { setIsAddDialogOpen(false); resetPermissionForm(); }}
              className="h-9 md:h-10 px-3 md:px-4 text-sm md:text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePermission}
              disabled={
                !permissionForm.name ||
                (!permissionForm.module && !permissionForm.newModule) ||
                !permissionForm.action
              }
              className="h-9 md:h-10 px-4 md:px-5 text-sm md:text-base"
            >
              Create Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
  </div>

  {/* Filters Row */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-0 mb-4 md:mb-6">
    <div className="flex flex-1 max-w-full md:max-w-md items-center gap-2">
      <Input
        placeholder="Search permissions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full h-9 md:h-10 text-sm md:text-base"
      />
      <Button variant="outline" type="submit" className="h-9 md:h-10 px-3 md:px-4">
        <Search className="h-3.5 w-3.5 md:h-4 md:w-4" />
      </Button>
    </div>

    <div className="flex items-center sm:ml-4">
      <Select value={filterModule} onValueChange={setFilterModule}>
        <SelectTrigger className="w-[150px] md:w-[180px] h-9 md:h-10 text-sm md:text-base">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by module" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Modules</SelectItem>
          {availableModules.map((module) => (
            <SelectItem key={module} value={module}>
              {module.charAt(0).toUpperCase() + module.slice(1)} ({modulePermissionCounts[module] || 0})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>

  {/* Content */}
  {isLoading ? (
    <div className="flex justify-center items-center h-56 md:h-64">
      <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ) : filteredPermissions.length > 0 ? (
    <Card className="w-full md:w-auto">
      <CardContent className="p-0">
        {/* Mobile: allow horizontal scroll; desktop normal */}
        <div className="overflow-x-auto md:overflow-visible">
          <Table className="text-xs md:text-sm min-w-[640px] md:min-w-0">
            <TableHeader>
              <TableRow className="*:[&>th]:px-2 *:[&>th]:py-1.5 md:*:[&>th]:px-4 md:*:[&>th]:py-3">
                <TableHead className="whitespace-nowrap">Permission Name</TableHead>
                <TableHead className="whitespace-nowrap">Module</TableHead>
                <TableHead className="whitespace-nowrap">Action</TableHead>
                <TableHead className="whitespace-nowrap">Description</TableHead>
                <TableHead className="text-right whitespace-nowrap">Options</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredPermissions.map((permission) => (
                <TableRow
                  key={permission.id}
                  className="*:[&>td]:px-2 *:[&>td]:py-1.5 md:*:[&>td]:px-4 md:*:[&>td]:py-3 align-top"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {permission.isSystemPermission && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Lock className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent className="text-xs md:text-sm">
                              <p>System permission - cannot be modified</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <span className="truncate">{permission.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="capitalize text-[10px] md:text-xs">
                      {permission.module}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge className="capitalize bg-primary/10 text-primary border-primary/20 text-[10px] md:text-xs">
                      {permission.action}
                    </Badge>
                  </TableCell>

                  <TableCell className="max-w-[200px] md:max-w-[300px]">
                    <span className="block truncate">{permission.description || "—"}</span>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8">
                          <MoreHorizontal className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => viewPermissionDetails(permission)}>
                          View Details
                        </DropdownMenuItem>

                        {hasPermission("permissions", "edit") && !permission.isSystemPermission && (
                          <DropdownMenuItem onClick={() => setupEditForm(permission)}>
                            Edit Permission
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        {hasPermission("permissions", "delete") && !permission.isSystemPermission && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeletePermission(permission.id)}
                          >
                            Delete Permission
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  ) : (
    <div className="flex flex-col items-center justify-center h-56 md:h-64 bg-muted/50 rounded-lg">
      <AlertCircle className="h-9 w-9 md:h-10 md:w-10 text-muted-foreground mb-2" />
      <h3 className="text-base md:text-lg font-medium">No permissions found</h3>
      <p className="text-xs md:text-base text-muted-foreground text-center">
        {searchQuery || filterModule
          ? "Try adjusting your search or filter"
          : "Add a new permission to get started"}
      </p>
    </div>
  )}

  {/* View Permission Dialog */}
  {currentPermission && (
    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
      <DialogContent className="w-[95vw] md:w-auto max-w-none md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
            <Lock className="h-4 w-4 md:h-5 md:w-5" />
            {currentPermission.name}
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Permission details
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:gap-4 py-3 md:py-4">
          <div className="grid grid-cols-[90px_1fr] md:grid-cols-[100px_1fr] gap-2 text-sm md:text-base">
            <div className="text-muted-foreground">Module:</div>
            <div className="font-medium capitalize">{currentPermission.module}</div>

            <div className="text-muted-foreground">Action:</div>
            <div className="font-medium capitalize">{currentPermission.action}</div>

            <div className="text-muted-foreground">Description:</div>
            <div>{currentPermission.description || "—"}</div>

            {currentPermission.createdAt && (
              <>
                <div className="text-muted-foreground">Created:</div>
                <div>{new Date(currentPermission.createdAt).toLocaleDateString()}</div>
              </>
            )}

            {currentPermission.updatedAt && (
              <>
                <div className="text-muted-foreground">Updated:</div>
                <div>{new Date(currentPermission.updatedAt).toLocaleDateString()}</div>
              </>
            )}

            {currentPermission.isSystemPermission && (
              <>
                <div className="text-muted-foreground">Type:</div>
                <div className="flex items-center text-amber-500">
                  <Lock className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                  System Permission
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2">
            {hasPermission("permissions", "edit") && !currentPermission.isSystemPermission && (
              <Button
                variant="outline"
                onClick={() => { setIsViewDialogOpen(false); setupEditForm(currentPermission); }}
                className="h-9 md:h-10 px-3 md:px-4 text-sm md:text-base"
              >
                <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                Edit
              </Button>
            )}
            <Button
              onClick={() => setIsViewDialogOpen(false)}
              className="h-9 md:h-10 px-4 md:px-5 text-sm md:text-base"
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )}

  {/* Edit Permission Dialog */}
  {currentPermission && (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="w-[95vw] md:w-auto max-w-none md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg">Edit Permission</DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Update permission details
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:gap-4 py-3 md:py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="grid gap-1.5 md:gap-2">
              <Label htmlFor="edit-module" className="text-xs md:text-sm">Module</Label>

              {permissionForm.isNewModule ? (
                <div className="grid gap-1.5 md:gap-2">
                  <Input
                    id="edit-newModule"
                    name="newModule"
                    placeholder="Enter new module name"
                    value={permissionForm.newModule}
                    onChange={handleFormChange}
                    className="h-9 md:h-10 text-sm md:text-base"
                  />
                  <Button
                    variant="link"
                    className="justify-start px-0 text-xs md:text-sm"
                    onClick={() => toggleNewModuleInput(false)}
                  >
                    Select existing module
                  </Button>
                </div>
              ) : (
                <div className="grid gap-1.5 md:gap-2">
                  <Select
                    value={permissionForm.module}
                    onValueChange={(value) => handleSelectChange('module', value)}
                  >
                    <SelectTrigger className="h-9 md:h-10 text-sm md:text-base">
                      <SelectValue placeholder="Select a module" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModules.map((module) => (
                        <SelectItem key={module} value={module}>
                          {module.charAt(0).toUpperCase() + module.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="link"
                    className="justify-start px-0 text-xs md:text-sm"
                    onClick={() => toggleNewModuleInput(true)}
                  >
                    Add new module
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-1.5 md:gap-2">
              <Label htmlFor="edit-action" className="text-xs md:text-sm">Action</Label>
              <Select
                value={permissionForm.action}
                onValueChange={(value) => handleSelectChange('action', value)}
              >
                <SelectTrigger className="h-9 md:h-10 text-sm md:text-base">
                  <SelectValue placeholder="Select an action" />
                </SelectTrigger>
                <SelectContent>
                  {availableActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5 md:gap-2">
            <Label htmlFor="edit-name" className="text-xs md:text-sm">Permission Name</Label>
            <Input
              id="edit-name"
              name="name"
              placeholder="Enter permission name"
              value={permissionForm.name}
              onChange={handleFormChange}
              className="h-9 md:h-10 text-sm md:text-base"
            />
          </div>

          <div className="grid gap-1.5 md:gap-2">
            <Label htmlFor="edit-description" className="text-xs md:text-sm">Description (Optional)</Label>
            <Textarea
              id="edit-description"
              name="description"
              placeholder="Briefly describe what this permission allows"
              value={permissionForm.description}
              onChange={handleFormChange}
              rows={3}
              className="text-sm md:text-base"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 md:gap-0">
          <Button
            variant="outline"
            onClick={() => { setIsEditDialogOpen(false); setCurrentPermission(null); resetPermissionForm(); }}
            className="h-9 md:h-10 px-3 md:px-4 text-sm md:text-base"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdatePermission}
            disabled={
              !permissionForm.name ||
              (!permissionForm.module && !permissionForm.newModule) ||
              !permissionForm.action
            }
            className="h-9 md:h-10 px-4 md:px-5 text-sm md:text-base"
          >
            Update Permission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )}
</div>

  );
};

export default PermissionManagement; 