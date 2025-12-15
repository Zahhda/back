import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Heart, Trash2, MapPin, Home } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface WishlistItem {
  id: string;
  propertyId: string;
  userId: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    title: string;
    price: number;
    address: string;
    city: string;
    state: string;
    propertyType: string;
    availabilityStatus: string;
    images: string[];
    owner: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}
const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const PropertyWishlist: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/auth/login');
        return;
      }

      const response = await axios.get(`${API_URL}/wishlists`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setWishlistItems(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching wishlist');
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/auth/login');
        return;
      }

      await axios.delete(`${API_URL}/wishlists/${wishlistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update state to remove the item
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== wishlistId));
      toast.success('Property removed from wishlist');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error removing from wishlist');
      console.error('Error removing from wishlist:', err);
    }
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
        <p className="text-muted-foreground mb-4">Start adding properties to your wishlist</p>
        <Button onClick={() => navigate('/properties')}>Browse Properties</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Wishlist</h2>
        <Button variant="outline" onClick={() => navigate('/properties')}>Browse More Properties</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div 
              className="h-48 bg-cover bg-center" 
              style={{ 
                backgroundImage: item.property.images && item.property.images.length > 0 
                  ? `url(${item.property.images[0]})` 
                  : 'url(/placeholder-property.jpg)' 
              }}
            />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{item.property.title}</CardTitle>
              <CardDescription className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {item.property.address}, {item.property.city}, {item.property.state}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex justify-between mb-2">
                <span className="text-lg font-semibold">{formatCurrency(item.property.price)}</span>
                <span className="flex items-center text-sm">
                  <Home className="h-4 w-4 mr-1" />
                  {item.property.propertyType}
                </span>
              </div>
              {item.notes && (
                <div className="text-sm text-muted-foreground mt-2 border-t pt-2">
                  <p className="font-medium">Your notes:</p>
                  <p>{item.notes}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => handleViewProperty(item.property.id)}
              >
                View Details
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => removeFromWishlist(item.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PropertyWishlist; 