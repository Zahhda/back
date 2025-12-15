import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Property, formatPropertyId } from '@/services/propertyService';
import { ArrowLeft } from "lucide-react";
import axios from 'axios';
import PageHeader from '@/components/PageHeader';

const AddProperty: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    propertyType: '',
    status: 'available',
    price: 0,
    address: '',
    city: '',
    state: '',
    ownerId: Number(user?.id) || 0,
    house_type: '',
    totalArea: 0,
    furnish_type: '',
    pincode: 0,
    landmark: '',
    area: '',
    bedrooms: 0,
    bathrooms: 0,
    listing_tags: [],
    cover_image: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? parseFloat(value) : 0
    }));
  };

  const validateForm = () => {
    const requiredFields = ['title', 'property_type', 'address', 'city', 'state', 'price'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    if (!formData.ownerId) {
      toast.error('Owner ID is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const propertyResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/properties`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Property added successfully');
      navigate('/admin/property-management');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Error adding property';
      
      // Handle validation errors
      if (err.response?.data?.error && typeof err.response.data.error === 'string') {
        const validationErrors = err.response.data.error
          .split('\n')
          .filter(Boolean)
          .map(error => error.replace('notNull Violation: ', ''));
        
        validationErrors.forEach(error => {
          toast.error(error);
        });
      } else {
        toast.error(errorMessage);
      }
      
      console.error('Error adding property:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  };

  if (!user || user.userType !== 'admin') {
    navigate('/admin-fallback');
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader 
          title="Add New Property"
          backLink="/admin/property-management"
          onLogout={handleLogout}
        />
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="bg-white dark:bg-zinc-800 shadow rounded-lg">
              <form onSubmit={handleSubmit} className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700">
                  {/* Basic Information */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Property Title</Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="propertyType">Property Type</Label>
                        <Select
                          name="propertyType"
                          value={formData.propertyType}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="plot">Plot</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="house_type">House Type</Label>
                        <Select
                          name="house_type"
                          value={formData.house_type}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, house_type: value }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select house type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1bhk">1 BHK</SelectItem>
                            <SelectItem value="2bhk">2 BHK</SelectItem>
                            <SelectItem value="3bhk">3 BHK</SelectItem>
                            <SelectItem value="4bhk">4 BHK</SelectItem>
                            <SelectItem value="penthouse">Penthouse</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          name="status"
                          value={formData.status}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="rented">Rented</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleNumberChange}
                          required
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="totalArea">Area Size (sq ft)</Label>
                        <Input
                          id="totalArea"
                          name="totalArea"
                          type="number"
                          value={formData.totalArea}
                          onChange={handleNumberChange}
                          required
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="furnish_type">Furnish Type</Label>
                        <Select
                          name="furnish_type"
                          value={formData.furnish_type}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, furnish_type: value }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select furnish type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="furnished">Furnished</SelectItem>
                            <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                            <SelectItem value="unfurnished">Unfurnished</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Location Information</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Full Address</Label>
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          className="w-full min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          type="number"
                          value={formData.pincode}
                          onChange={handleNumberChange}
                          required
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="landmark">Landmark</Label>
                        <Input
                          id="landmark"
                          name="landmark"
                          value={formData.landmark}
                          onChange={handleChange}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="area">Area/Locality</Label>
                        <Input
                          id="area"
                          name="area"
                          value={formData.area}
                          onChange={handleChange}
                          required
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bedrooms">Number of Bedrooms</Label>
                        <Input
                          id="bedrooms"
                          name="bedrooms"
                          type="number"
                          value={formData.bedrooms}
                          onChange={handleNumberChange}
                          required
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bathrooms">Number of Bathrooms</Label>
                        <Input
                          id="bathrooms"
                          name="bathrooms"
                          type="number"
                          value={formData.bathrooms}
                          onChange={handleNumberChange}
                          required
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="listing_tags">Listing Tags (comma separated)</Label>
                        <Input
                          id="listing_tags"
                          name="listing_tags"
                          value={formData.listing_tags?.join(', ')}
                          onChange={handleChange}
                          placeholder="e.g., pool, garden, parking"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cover_image">Cover Image URL</Label>
                        <Input
                          id="cover_image"
                          name="cover_image"
                          value={formData.cover_image}
                          onChange={handleChange}
                          placeholder="https://example.com/image.jpg"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-800/50 flex justify-end">
                  <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading ? 'Adding...' : 'Add Property'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProperty; 