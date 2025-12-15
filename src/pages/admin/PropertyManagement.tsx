import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2 } from "lucide-react";
import {
  Search,
  Trash2,
  Eye,
  Filter,
  X,
  MoreHorizontal,
  Pencil,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, capitalizeFirstLetter } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import { useAuth } from "@/contexts/AuthContext";
import { getProperties, Property, formatPropertyId } from '@/services/propertyService';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const coerceToList = (raw: unknown): any[] => {
  if (Array.isArray(raw)) return raw;
  const anyRaw = raw as any;
  if (Array.isArray(anyRaw?.properties)) return anyRaw.properties;
  if (Array.isArray(anyRaw?.data?.properties)) return anyRaw.data.properties;
  return [];
};

const API_URL = import.meta.env.VITE_API_URL || 'https://dorpay.in/api';

type StatusUnion = 'all' | 'available' | 'rented' | 'sold' | 'pending';

const getAvailability = (p: any) =>
  p?.availabilityStatus ?? p?.status ?? p?.availability_status ?? 'pending';

const PropertyManagement: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusUnion>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const navigate = useNavigate();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user || !hasPermission("property_management", "view")) {
      navigate("/admin-fallback");
      toast.error("You don't have permission to access this page");
    }
  }, [user, hasPermission, navigate]);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [searchTerm, statusFilter, typeFilter, properties]);

  // replace your entire fetchProperties with this version
  const fetchProperties = async () => {
    try {
      setLoading(true);

      const raw = (await getProperties({ isAdmin: true })) as unknown;
      const list = coerceToList(raw); // <-- no direct .data access

      const transformed = list.map((p: any) => ({
        ...p,
        id: String(p.id),
        availabilityStatus: getAvailability(p),
        viewCount: p?.view_count ?? p?.viewCount ?? 0,
        // safe defaults so the row renders even if fields are missing
        title: p?.title ?? 'Untitled',
        address: p?.address ?? '',
        city: p?.city ?? '',
        state: p?.state ?? '',
        numRooms: p?.numRooms ?? 0,
        numBathrooms: p?.numBathrooms ?? 0,
        area_size: p?.area_size ?? p?.areaSize ?? 0,
        propertyType: p?.propertyType ?? p?.type ?? 'unknown',
        price: p?.price ?? 0,
        cover_image: p?.cover_image ?? p?.coverImage ?? '',
      }));

      setProperties(transformed as Property[]);
      setFilteredProperties(transformed as Property[]);
      setError(null);

      const types = Array.from(
        new Set(transformed.map((p: any) => p.propertyType || 'unknown'))
      )
        .filter(Boolean)
        .sort() as string[];

      setPropertyTypes(types);
    } catch (err: any) {
      setError(err?.message || 'Error fetching properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };


  // 2) (Optional) In filterProperties(), early-return when all filters are neutral to avoid extra work:
  const filterProperties = () => {
    // if nothing to filter, just mirror properties
    if (!searchTerm && statusFilter === 'all' && typeFilter === 'all') {
      setFilteredProperties(properties);
      return;
    }

    let filtered = [...properties];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((property: any) =>
        (property.title ?? '').toLowerCase().includes(q) ||
        (property.address ?? '').toLowerCase().includes(q) ||
        (property.city ?? '').toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((property: any) => getAvailability(property) === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((property: any) => property.propertyType === typeFilter);
    }

    setFilteredProperties(filtered as Property[]);
  };


  const updatePropertyStatus = async (id: string, status: Exclude<StatusUnion, 'all'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      await axios.put(
        `${API_URL}/properties/update/${id}`,
        { availabilityStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProperties(prev =>
        prev.map((p: any) =>
          String(p.id) === String(id) ? { ...p, availabilityStatus: status, status } : p
        )
      );

      toast.success(`Property status updated to ${status}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Error updating property status';
      toast.error(errorMessage);
      console.error('Error updating property:', err);
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      setDeleting(true);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setDeleting(false);
        return;
      }

      await axios.delete(`${API_URL}/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProperties(prev => prev.filter(p => String(p.id) !== String(id)));

      setConfirmDeleteOpen(false);
      setDeleteSuccessOpen(true);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error deleting property';
      toast.error(errorMessage);
      console.error('Error deleting property:', err);
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  const getFormattedPropertyId = (property: Property) => {
    if (!property || !property.id) return 'N/A';
    return formatPropertyId(property.id as any);
  };

  const handleAddProperty = () => navigate('/dashboard/properties/add');
  const handleEditProperty = (id: string) => navigate(`/dashboard/properties/edit/${id}`);
  const handleViewProperty = (id: string) => navigate(`/dashboard/properties/${id}`);

  if (loading) return <div className="p-6 text-center">Loading properties...</div>;

  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-2xl mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {typeof error === 'string' ? error : 'An unexpected error occurred'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title row */}
        <div className="flex flex-row justify-between items-center gap-2">
          {/* <h2 className="text-sm md:text-2xl font-bold leading-tight whitespace-nowrap">
  Property Management
</h2> */}

          <h2 className="text-sm md:text-2xl font-bold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            Property Management
          </h2>



          {hasPermission("property_management", "create") && (
            <Button
              onClick={handleAddProperty}
              className="h-7 px-2 text-[10px] md:h-10 md:px-4 md:text-sm shrink-0"
            >
              <X className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              Add New Property
            </Button>
          )}
        </div>

        {/* Search + Filters */}
        <div className="mt-4 bg-card rounded-lg shadow-sm p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:items-stretch md:justify-between gap-3 md:gap-4">

            {/* Search row (centered on mobile) */}
            <div className="w-full md:flex-1 max-w-[520px] md:max-w-none mx-auto">
              <div className="relative">
                <Search className="absolute left-2 top-2 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 md:pl-8 h-8 md:h-10 text-xs md:text-sm w-full"
                />
              </div>
            </div>

            {/* Filters row (centered & full width on mobile) */}
            <div className="w-full md:w-auto max-w-[520px] md:max-w-none mx-auto">
              <div className="flex flex-row items-stretch gap-2 md:gap-4 w-full">

                {/* Status */}
                <div className="flex-1 min-w-0">
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusUnion)}>
                    <SelectTrigger className="h-8 md:h-10 text-xs md:text-sm w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="text-xs md:text-sm">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type */}
                <div className="flex-1 min-w-0">
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v)}>
                    <SelectTrigger className="h-8 md:h-10 text-xs md:text-sm w-full">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="text-xs md:text-sm">
                      <SelectItem value="all">All Types</SelectItem>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {capitalizeFirstLetter(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear */}
                <div className="flex-1 min-w-0">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="h-8 md:h-10 px-3 md:px-4 text-xs md:text-sm w-full whitespace-nowrap"
                  >
                    <X className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                    Clear
                  </Button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="flex-1 overflow-hidden p-4 md:p-6">
        {filteredProperties.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Filter className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mb-3 md:mb-4" />
            <h3 className="text-base md:text-xl font-semibold mb-1.5 md:mb-2">No properties found</h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
              Try adjusting your search or filters
            </p>
            <Button variant="outline" onClick={clearFilters} className="h-8 md:h-10 px-3 md:px-4 text-xs md:text-sm">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <Table className="text-xs md:text-sm">
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow className="*:[&>th]:px-2 *:[&>th]:py-2 md:*:[&>th]:px-4 md:*:[&>th]:py-3">
                  <TableHead className="whitespace-nowrap">ID</TableHead>
                  <TableHead className="whitespace-nowrap">Property</TableHead>
                  <TableHead className="whitespace-nowrap">Location</TableHead>
                  <TableHead className="whitespace-nowrap">Type</TableHead>
                  <TableHead className="whitespace-nowrap">Price</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredProperties.map((property: any) => {
                  const availability = getAvailability(property);

                  return (
                    <TableRow
                      key={property.id}
                      className="*:[&>td]:px-2 *:[&>td]:py-2 md:*:[&>td]:px-4 md:*:[&>td]:py-3 align-top"
                    >
                      <TableCell className="font-medium">{getFormattedPropertyId(property)}</TableCell>

                      <TableCell>
                        <div className="flex items-start gap-2.5 md:gap-3">
                          {property.cover_image && (
                            <img
                              src={property.cover_image}
                              alt={property.title}
                              className="w-10 h-10 md:w-12 md:h-12 object-cover rounded"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-xs md:text-sm truncate max-w-[140px] md:max-w-none">
                              {property.title}
                            </div>
                            <div className="text-[11px] md:text-sm text-muted-foreground">
                              {property.numRooms} beds • {property.numBathrooms} baths
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                          <span className="truncate max-w-[140px] md:max-w-none">
                            {property.city}, {property.state}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="capitalize">{property.propertyType}</span>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">{formatCurrency(property.price)}</TableCell>

                      <TableCell>
                        <Badge
                          className="text-[10px] md:text-xs px-2 py-0.5"
                          variant={
                            availability === 'available'
                              ? 'default'
                              : availability === 'sold'
                                ? 'destructive'
                                : availability === 'rented'
                                  ? 'secondary'
                                  : 'outline'
                          }
                        >
                          {availability}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8">
                              <MoreHorizontal className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs md:text-sm">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewProperty(String(property.id))}>
                              <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProperty(String(property.id))}>
                              <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                              Edit Property
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setDeletingId(String(property.id));
                                setConfirmDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                              Delete Property
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Confirm Delete dialog */}
      <AlertDialog open={confirmDeleteOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete property?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The property will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteProperty(deletingId)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success dialog (OK-only close) */}
      <AlertDialog open={deleteSuccessOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Success
            </AlertDialogTitle>
            <AlertDialogDescription>
              Property deleted successfully.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setDeleteSuccessOpen(false)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default PropertyManagement;
