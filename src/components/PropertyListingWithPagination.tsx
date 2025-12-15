import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import type { Property as ServiceProperty } from "@/services/propertyService";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getProperties, Property } from '@/services/propertyService';
import { Search, Filter } from 'lucide-react';
import { capitalizeFirstLetter } from "@/lib/utils";
interface PropertyCardProps {
  property: ServiceProperty;
}
const PropertyListingWithPagination = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    propertyType: '',
    furnishType: '',
    area: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parse numeric values from filters
      const params: any = {
        page: currentPage,
        limit: 6, // Number of items per page
        search: searchTerm
      };

      if (filters.minPrice) params.minPrice = parseInt(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = parseInt(filters.maxPrice);
      if (filters.bedrooms) params.bedrooms = parseInt(filters.bedrooms);
      if (filters.propertyType) params.propertyType = filters.propertyType;
      if (filters.furnishType) params.furnishType = filters.furnishType;
      if (filters.area) params.area = filters.area;

      const response = await getProperties(params);

      if (response && response.properties) {
        setProperties(response.properties);
        setTotalPages(response.totalPages || 0);
      } else {
        // Handle case where response is not in expected format
        setProperties([]);
        setTotalPages(0);
        setError('Received unexpected response format from server.');
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setProperties([]);
      setTotalPages(0);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchProperties();
  }, [currentPage, searchTerm, filters.minPrice, filters.maxPrice, filters.bedrooms, filters.propertyType, filters.furnishType, filters.area]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchProperties();
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate pagination links
  const renderPaginationLinks = () => {
    const links = [];

    // Add first page
    links.push(
      <PaginationItem key="first">
        <PaginationLink
          isActive={currentPage === 1}
          onClick={() => setCurrentPage(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Add ellipsis if needed
    if (currentPage > 3) {
      links.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i <= 1 || i >= totalPages) continue;
      links.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
      links.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Add last page if there's more than one page
    if (totalPages > 1) {
      links.push(
        <PaginationItem key="last">
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return links;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Property Listings</h2>

        {/* Search and Filter */}
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" className="flex items-center gap-2">
              <Search size={16} />
              <span>Search</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              <span>Filters</span>
            </Button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Price Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                  />
                  <Input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bedrooms</label>
                <select
                  name="bedrooms"
                  value={filters.bedrooms}
                  onChange={handleFilterChange as any}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Any</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Property Type</label>
                <select
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleFilterChange as any}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Any</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Furnish Type</label>
                <select
                  name="furnishType"
                  value={filters.furnishType}
                  onChange={handleFilterChange as any}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Any</option>
                  <option value="furnished">Furnished</option>
                  <option value="semifurnished">Semi-Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Area</label>
                <Input
                  type="text"
                  name="area"
                  placeholder="Area"
                  value={filters.area}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={fetchProperties} className="w-full">Apply Filters</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-64 bg-gray-200 dark:bg-zinc-700 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Property Grid */}
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="h-64 overflow-hidden">
                    <img
                      src={
                        property.cover_image
                        || (property.images?.length ? property.images[0] : '/fallback-thumbnail.png')
                      }
                      alt={property.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{property.title}</h3>
                      {/* <Badge variant={
                        property.status === 'available' ? 'default' :
                        property.status === 'rented' ? 'secondary' :
                        property.status === 'sold' ? 'destructive' : 'outline'
                      }>
                        {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                        
                      </Badge> */}

                      <Badge variant={
                        property.status === 'available' ? 'default' :
                          property.status === 'rented' ? 'secondary' :
                            property.status === 'sold' ? 'destructive' :
                              'outline'
                      }>
                        {capitalizeFirstLetter(property.status)}
                      </Badge>

                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <span>{property.bedrooms} Beds</span>
                      <span>•</span>
                      <span>{property.bathrooms} Baths</span>
                      <span>•</span>
                      <span>{property.area_size} sq ft</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="font-medium">{property.area}</span>
                      <span>•</span>
                      <span>{property.city}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="font-bold text-lg">₹{property.price.toLocaleString('en-IN')}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/properties/${property.id}`)}
                        
                      >View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-zinc-800 rounded-lg">
              <p className="text-lg text-gray-500 dark:text-gray-400">No properties found matching your criteria.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters or search to find more properties.</p>
              <Button onClick={() => {
                setSearchTerm('');
                setFilters({
                  minPrice: '',
                  maxPrice: '',
                  bedrooms: '',
                  propertyType: '',
                  furnishType: '',
                  area: ''
                });
                setCurrentPage(1);
                fetchProperties();
              }} variant="outline" className="mt-4">
                Reset All Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {properties.length > 0 && totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                {renderPaginationLinks()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default PropertyListingWithPagination; 