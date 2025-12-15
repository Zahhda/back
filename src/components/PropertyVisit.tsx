import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'react-hot-toast';
import { CalendarDays, Video } from 'lucide-react';

interface PropertyVisitProps {
  propertyId: string;
  propertyTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PropertyVisit: React.FC<PropertyVisitProps> = ({
  propertyId,
  propertyTitle,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [visitType, setVisitType] = useState<'online' | 'offline'>('offline');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast.error('Please select a date for your visit');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('You need to be logged in to schedule a visit');
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/visits`,
        {
          propertyId,
          visitType,
          scheduledDate: selectedDate.toISOString(),
          notes: notes.trim() || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Visit scheduled successfully!');
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to schedule visit');
      console.error('Error scheduling visit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule a Visit</DialogTitle>
          <DialogDescription>
            Schedule a visit to view "{propertyTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="visit-type">Visit Type</Label>
            <RadioGroup id="visit-type" value={visitType} onValueChange={(value: 'online' | 'offline') => setVisitType(value)} className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="offline" id="offline" />
                <Label htmlFor="offline" className="flex items-center">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  In-person Visit
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="flex items-center">
                  <Video className="h-4 w-4 mr-2" />
                  Virtual Tour
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Select Date and Time</Label>
            <div className="border rounded-md p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                  // Disable dates in the past
                  return date < new Date(new Date().setHours(0, 0, 0, 0));
                }}
                className="mx-auto"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requests or questions about the property..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Visit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyVisit; 