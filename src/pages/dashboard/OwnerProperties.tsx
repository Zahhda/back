import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Plus,
  User,
  MessageSquare
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

interface Property {
  id: string;
  title: string;
  ownerId: string;
  price: number;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  availabilityStatus: 'available' | 'rented' | 'sold' | 'pending';
  createdAt: string;
  updatedAt: string;
  images: string[];

  owner?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}


interface Visit {
  id: string;
  propertyId: string;
  userId: string;
  visitType: 'online' | 'offline';
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  feedback: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
  };
  property: {
    id: string;
    title: string;
    propertyType: string;
  };
}

const OwnerProperties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitsLoading, setVisitsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token) return;
    fetchProperties();
    fetchVisits();
  }, [token, user?.id]);

  const fetchProperties = async () => {
    try {
      setLoading(true);

      if (!token) {
        setError('Authentication required');
        return;
      }
      if (!token) {
        navigate('/auth/login');
        return null;
      }
      // Prefer: backend filters by ownerId
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/properties`,
        {
          headers: { Authorization: `Bearer ${token}` },
          // If your API expects 'ownerId' = actual UUID, send user?.id.
          // If your API supports 'current' (token-based), keep it — but still filter locally as a guard.
          params: { ownerId: user?.id || 'current' }
        }
      );

      const all = response.data?.properties ?? [];

      // Defensive client-side filter to ensure ONLY the owner’s properties show
      const mine = user?.id ? all.filter((p: Property) => p.ownerId === user.id) : all;
      console.log("Fetched properties:", all);
      console.log("One example property:", all[0]);
      console.log("Owner object inside property:", all[0]?.owner);
      setProperties(mine);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching properties');
      console.error('Error fetching properties:', err);

    } finally {
      setLoading(false);
    }
  };


  const fetchVisits = async () => {
    try {
      setVisitsLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/visits/owner/properties`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setVisits(response.data);
    } catch (err: any) {
      console.error('Error fetching visits:', err);
    } finally {
      setVisitsLoading(false);
    }
  };

  const deleteProperty = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication required');
        return;
      }

      await axios.delete(`${import.meta.env.VITE_API_URL}/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setProperties(properties.filter(property => property.id !== id));
      toast.success('Property deleted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error deleting property');
      console.error('Error deleting property:', err);
    }
  };

  const updateVisitStatus = async (visitId: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/visits/owner/${visitId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setVisits(visits.map(visit =>
        visit.id === visitId ? { ...visit, status } : visit
      ));

      toast.success(`Visit status updated to ${status}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating visit status');
      console.error('Error updating visit:', err);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading your properties...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  const pendingVisits = visits.filter(visit => visit.status === 'scheduled');
  const completedVisits = visits.filter(visit => visit.status === 'completed');
  const cancelledVisits = visits.filter(visit => visit.status === 'cancelled');

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Properties</h2>
        <Button onClick={() => navigate('/dashboard/properties/add')}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Property
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-10">
          <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No properties found</h3>
          <p className="text-muted-foreground mb-4">You haven't listed any properties yet</p>
          <Button onClick={() => navigate('/dashboard/properties/add')}>Add Your First Property</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div
                className="h-48 bg-cover bg-center"
                style={{
                  backgroundImage: property.images && property.images.length > 0
                    ? `url(${property.images[0]})`
                    : 'url(/placeholder-property.jpg)'
                }}
              />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{property.title}</CardTitle>
                  <Badge
                    variant={
                      property.availabilityStatus === 'available' ? 'default' :
                        property.availabilityStatus === 'sold' ? 'destructive' :
                          property.availabilityStatus === 'rented' ? 'secondary' :
                            'outline'
                    }
                  >
                    {property.availabilityStatus}
                  </Badge>
                </div>
                <CardDescription className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.address}, {property.city}, {property.state}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between mb-2">
                  <span className="text-lg font-semibold">{formatCurrency(property.price)}</span>
                  <span className="flex items-center text-sm">
                    <Home className="h-4 w-4 mr-1" />
                    <span className="capitalize">{property.propertyType}</span>
                  </span>
                </div>
                <div className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Listed on {new Date(property.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/properties/${property.id}`)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/dashboard/properties/edit/${property.id}`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteProperty(property.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />

                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6">Property Visits</h2>

        {visitsLoading ? (
          <div className="p-6 text-center">Loading visits...</div>
        ) : visits.length === 0 ? (
          <div className="text-center py-10">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No scheduled visits</h3>
            <p className="text-muted-foreground mb-4">You don't have any property visits yet</p>
          </div>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({pendingVisits.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedVisits.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({cancelledVisits.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingVisits.length > 0 ? pendingVisits.map(visit => (
                  <Card key={visit.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{visit.property.title}</CardTitle>
                      <CardDescription>
                        {visit.visitType === 'online' ? 'Virtual Tour' : 'In-person Visit'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>{visit.user.firstName} {visit.user.lastName}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(visit.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{new Date(visit.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => updateVisitStatus(visit.id, 'completed')}
                      >
                        Mark as Completed
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => updateVisitStatus(visit.id, 'cancelled')}
                      >
                        Cancel Visit
                      </Button>
                    </CardFooter>
                  </Card>
                )) : (
                  <div className="col-span-2 text-center py-6">
                    <p className="text-muted-foreground">No pending visits</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedVisits.length > 0 ? completedVisits.map(visit => (
                  <Card key={visit.id}>
                    <CardHeader>
                      <div className="flex justify-between">
                        <div>
                          <CardTitle className="text-base">{visit.property.title}</CardTitle>
                          <CardDescription>
                            {visit.visitType === 'online' ? 'Virtual Tour' : 'In-person Visit'}
                          </CardDescription>
                        </div>
                        <Badge variant="default">Completed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>{visit.user.firstName} {visit.user.lastName}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(visit.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        {visit.feedback && (
                          <div className="mt-2 p-2 bg-muted rounded-md">
                            <div className="flex items-center mb-1">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              <span className="font-medium">Feedback:</span>
                            </div>
                            <p className="text-sm">{visit.feedback}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="col-span-2 text-center py-6">
                    <p className="text-muted-foreground">No completed visits</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="cancelled">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cancelledVisits.length > 0 ? cancelledVisits.map(visit => (
                  <Card key={visit.id}>
                    <CardHeader>
                      <div className="flex justify-between">
                        <div>
                          <CardTitle className="text-base">{visit.property.title}</CardTitle>
                          <CardDescription>
                            {visit.visitType === 'online' ? 'Virtual Tour' : 'In-person Visit'}
                          </CardDescription>
                        </div>
                        <Badge variant="destructive">Cancelled</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>{visit.user.firstName} {visit.user.lastName}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(visit.scheduledDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="col-span-2 text-center py-6">
                    <p className="text-muted-foreground">No cancelled visits</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default OwnerProperties; 