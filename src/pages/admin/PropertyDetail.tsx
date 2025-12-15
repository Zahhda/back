import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
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
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Bed,
  Bath,
  Calendar,
  User,
  Loader2,
  Banknote,
  Home,
  Tag,
  SquareIcon,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { formatPropertyId } from '@/services/propertyService';
import { formatCurrency } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';

// Types
interface Property {
  id: string;
  title: string;
  type: string;
  status: 'available' | 'pending' | 'sold' | 'draft';
  price: number;
  location: string;
  description?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  featuredImage?: string;
  images?: string[];
  amenities?: string[];
  yearBuilt?: number;
  parkingSpaces?: number;
  city: string;
  state: string;
  pincode: string;
}

// API URL from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const PropertyDetail = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check permissions
  useEffect(() => {
    if (!user || !hasPermission("property_management", "view")) {
      navigate("/admin-fallback");
      toast.error("You don't have permission to access this page");
    }
  }, [user, hasPermission, navigate]);

  // Fetch property details
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!propertyId) return;
      
      setIsLoading(true);
      try {
        // Fetch property details
        const response = await axios.get(`${API_URL}/api/properties/${propertyId}`);
        setProperty(response.data);
      } catch (error) {
        console.error("Error fetching property details:", error);
        toast.error("Failed to load property details");
        
        // For development: generate mock data
        if (import.meta.env.DEV) {
          generateMockData();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId]);

  // Generate mock data for development
  const generateMockData = () => {
    if (!propertyId) return;
    
    const mockProperty: Property = {
      id: propertyId,
      title: "Luxury Penthouse with City View",
      type: "penthouse",
      status: "available",
      price: 850000,
      location: "789 Skyline Drive, Downtown, City",
      description: "This stunning penthouse offers panoramic views of the city skyline. Featuring high-end finishes throughout, an open concept living space, gourmet kitchen with top-of-the-line appliances, and a private rooftop terrace perfect for entertaining. The master suite includes a spa-like bathroom and walk-in closet. Building amenities include 24-hour concierge, fitness center, and swimming pool.",
      bedrooms: 3,
      bathrooms: 2.5,
      area: 2500,
      createdAt: "2023-05-15T10:30:00Z",
      updatedAt: "2023-06-02T14:45:00Z",
      ownerId: "user123",
      ownerName: "Michael Reynolds",
      ownerEmail: "michael.reynolds@example.com",
      ownerPhone: "+1 (555) 123-4567",
      featuredImage: "https://placehold.co/600x400",
      images: [
        "https://placehold.co/600x400?text=Living+Room",
        "https://placehold.co/600x400?text=Kitchen",
        "https://placehold.co/600x400?text=Master+Bedroom",
        "https://placehold.co/600x400?text=Bathroom",
        "https://placehold.co/600x400?text=Terrace",
      ],
      amenities: [
        "Elevator",
        "Central Air",
        "In-unit Laundry",
        "Fireplace",
        "Hardwood Floors",
        "Walk-in Closets",
        "Smart Home Features",
        "Concierge Service",
        "Fitness Center",
        "Swimming Pool",
      ],
      yearBuilt: 2018,
      parkingSpaces: 2,
      city: "Downtown",
      state: "City",
      pincode: "12345",
    };
    
    setProperty(mockProperty);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Available
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            Pending
          </Badge>
        );
      case 'sold':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Sold
          </Badge>
        );
      case 'draft':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Draft
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  // Delete property
  const deleteProperty = async () => {
    if (!property) return;
    
    if (window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      try {
        // Make API call to delete property
        await axios.delete(`${API_URL}/api/properties/${property.id}`);
        
        toast.success("Property deleted successfully");
        navigate("/admin/property-management");
        
      } catch (error) {
        console.error("Error deleting property:", error);
        toast.error("Failed to delete property");
        
        // For development: simulate successful deletion
        if (import.meta.env.DEV) {
          toast.success("Property deleted successfully (Dev Mode)");
          navigate("/admin/property-management");
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/admin/property-management")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <PageHeader 
        title="Property Details"
        backLink="/admin/property-management"
      />

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{property.title}</h1>
            <Badge variant={
              property.status === 'available' ? 'default' :
              property.status === 'rented' ? 'secondary' :
              property.status === 'sold' ? 'destructive' : 'outline'
            }>
              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
            </Badge>
          </div>
          <div className="mt-2 flex items-center gap-2 text-muted-foreground">
            <span className="font-semibold">ID: {formatPropertyId(Number(property.id))}</span>
            <span>•</span>
            <MapPin className="h-4 w-4" />
            <span>{property.city}, {property.state}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {hasPermission("property_management", "edit") && (
            <Button 
              variant="outline"
              onClick={() => navigate(`/admin/property-management/edit/${property.id}`)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          
          {hasPermission("property_management", "delete") && (
            <Button 
              variant="destructive"
              onClick={deleteProperty}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(property.price)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Property Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{property.type}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Area Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property.area} sq ft</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Furnishing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{property.type}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Property Images */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {property.featuredImage && (
                  <img 
                    src={property.featuredImage} 
                    alt={property.title} 
                    className="w-full h-[300px] object-cover rounded-md"
                  />
                )}
                
                {property.images && property.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {property.images.map((image, index) => (
                      <img 
                        key={index}
                        src={image} 
                        alt={`${property.title} - Image ${index + 1}`} 
                        className="w-full h-24 object-cover rounded-md"
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Property Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {property.description || "No description available."}
              </p>
            </CardContent>
          </Card>
          
          {/* Property Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Price</span>
                  </div>
                  <span className="font-semibold">{formatPrice(property.price)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Type</span>
                  </div>
                  <span className="font-semibold capitalize">{property.type}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Status</span>
                  </div>
                  <div>{getStatusBadge(property.status)}</div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Bedrooms</span>
                  </div>
                  <span className="font-semibold">{property.bedrooms}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Bathrooms</span>
                  </div>
                  <span className="font-semibold">{property.bathrooms}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-2">
                    <SquareIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Area</span>
                  </div>
                  <span className="font-semibold">{property.area} sq ft</span>
                </div>
                
                {property.yearBuilt && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Year Built</span>
                    </div>
                    <span className="font-semibold">{property.yearBuilt}</span>
                  </div>
                )}
                
                {property.parkingSpaces !== undefined && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Parking Spaces</span>
                    </div>
                    <span className="font-semibold">{property.parkingSpaces}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Listed On</span>
                  </div>
                  <span className="font-semibold">{formatDate(property.createdAt)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Updated</span>
                  </div>
                  <span className="font-semibold">{formatDate(property.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle>Owner Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{property.ownerName || "Not available"}</p>
                    <p className="text-sm text-muted-foreground">Owner</p>
                  </div>
                </div>
                
                {property.ownerEmail && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{property.ownerEmail}</span>
                  </div>
                )}
                
                {property.ownerPhone && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{property.ownerPhone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail; 