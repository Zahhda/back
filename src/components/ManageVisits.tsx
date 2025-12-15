import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Calendar, MapPin, Clock, Video, Pencil, X, Check, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface PropertyVisit {
  id: string;
  propertyId: string;
  userId: string;
  visitType: 'online' | 'offline';
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string | null;
  feedback: string | null;
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
    images: string[];
    owner: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      mobileNumber: string;
    };
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
  };
}

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  loading: boolean;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ isOpen, onClose, onSubmit, loading }) => {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      onSubmit(feedback);
    } else {
      toast.error('Please enter your feedback');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
          <DialogDescription>
            Please share your experience about the property visit
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Your feedback..."
            className="min-h-[120px] mt-4"
          />
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !feedback.trim()}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ManageVisits: React.FC = () => {
  const [visits, setVisits] = useState<PropertyVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<PropertyVisit | null>(null);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/visits`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setVisits(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching visits');
      console.error('Error fetching visits:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelVisit = async (visitId: string) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/visits/${visitId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setVisits(visits.map(visit => 
        visit.id === visitId ? { ...visit, status: 'cancelled' } : visit
      ));
      
      toast.success('Visit cancelled successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error cancelling visit');
      console.error('Error cancelling visit:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const submitFeedback = async (feedback: string) => {
    if (!selectedVisit) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/visits/${selectedVisit.id}/feedback`,
        { feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setVisits(visits.map(visit => 
        visit.id === selectedVisit.id 
          ? { ...visit, status: 'completed', feedback } 
          : visit
      ));
      
      setIsFeedbackDialogOpen(false);
      setSelectedVisit(null);
      toast.success('Feedback submitted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error submitting feedback');
      console.error('Error submitting feedback:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeedbackClick = (visit: PropertyVisit) => {
    setSelectedVisit(visit);
    setIsFeedbackDialogOpen(true);
  };

  const filteredVisits = visits.filter(visit => {
    const today = new Date();
    const visitDate = new Date(visit.scheduledDate);
    
    if (activeTab === 'upcoming') {
      return visit.status === 'scheduled' && visitDate >= today;
    } else if (activeTab === 'past') {
      return visit.status === 'completed' || visitDate < today;
    } else if (activeTab === 'cancelled') {
      return visit.status === 'cancelled';
    }
    return true;
  });

  if (loading) {
    return <div className="p-6 text-center">Loading visits...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (visits.length === 0) {
    return (
      <div className="p-6 text-center">
        <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No scheduled visits</h3>
        <p className="text-muted-foreground mb-4">You haven't scheduled any property visits yet</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Property Visits</h2>
      
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past/Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredVisits.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-muted-foreground">No visits in this category</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Visit Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisits.map((visit) => {
                const visitDate = new Date(visit.scheduledDate);
                const isPast = visitDate < new Date();
                
                return (
                  <TableRow key={visit.id}>
                    <TableCell>
                      <div className="flex items-start space-x-3">
                        <div 
                          className="w-16 h-16 bg-cover bg-center rounded-md" 
                          style={{ 
                            backgroundImage: visit.property.images && visit.property.images.length > 0 
                              ? `url(${visit.property.images[0]})` 
                              : 'url(/placeholder-property.jpg)' 
                          }}
                        />
                        <div>
                          <div className="font-medium">{visit.property.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {visit.property.city}, {visit.property.state}
                          </div>
                          <div className="text-sm font-medium mt-1">{formatCurrency(visit.property.price)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {visit.visitType === 'online' ? (
                          <>
                            <Video className="h-4 w-4 mr-1 text-blue-500" />
                            <span>Virtual Tour</span>
                          </>
                        ) : (
                          <>
                            <Calendar className="h-4 w-4 mr-1 text-green-500" />
                            <span>In-person</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{visitDate.toLocaleDateString()}</span>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {visitDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          visit.status === 'completed' ? 'default' : 
                          visit.status === 'cancelled' ? 'destructive' : 
                          isPast ? 'outline' : 'secondary'
                        }
                      >
                        {visit.status === 'completed' 
                          ? 'Completed' 
                          : visit.status === 'cancelled' 
                            ? 'Cancelled' 
                            : isPast 
                              ? 'Pending Feedback' 
                              : 'Scheduled'}
                      </Badge>
                      {visit.feedback && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Feedback provided
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {visit.status === 'scheduled' && !isPast && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => cancelVisit(visit.id)}
                          disabled={actionLoading}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                      {visit.status === 'scheduled' && isPast && !visit.feedback && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleFeedbackClick(visit)}
                          disabled={actionLoading}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Add Feedback
                        </Button>
                      )}
                      {visit.status === 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600"
                          disabled
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Completed
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      
      <FeedbackDialog
        isOpen={isFeedbackDialogOpen}
        onClose={() => {
          setIsFeedbackDialogOpen(false);
          setSelectedVisit(null);
        }}
        onSubmit={submitFeedback}
        loading={actionLoading}
      />
    </div>
  );
};

export default ManageVisits; 