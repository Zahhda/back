/// <reference types="google.maps" />
import React, { useState, useRef, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, MapPin, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Loader } from "@googlemaps/js-api-loader";
const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const token = localStorage.getItem('token') ?? '';
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (inputField: HTMLInputElement, options?: any) => any;
          PlaceResult: {
            geometry?: {
              location: {
                lat: () => number;
                lng: () => number;
              };
            };
            formatted_address?: string;
          };
        };
        Map: new (element: HTMLElement, options?: any) => any;
        Marker: new (options?: any) => any;
        LatLng: new (lat: number, lng: number) => any;
        Geocoder: new () => any;
      };
    };
    initMap: () => void;
  }
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface PropertyFormData {
  propertyType: string;
  flatType: string;
  pgRoomType: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  zipcode: string;
  latitude: string;
  longitude: string;
  totalArea: number;
  furnishedStatus: string;
  numRooms: number;
  numBathrooms: number;
  amenities: string[];
  images: File[];
  ownerId: string;
  isAvailable: boolean;
  availableFrom: string;
  depositAmount: number;
  maintenanceCharges: number;
  propertyAge: number;
  facing: string;
  floorNumber: number;
  totalFloors: number;
  parking: string;
  waterSupply: string;
  electricity: string;
  security: string;
  nearbyPlaces: string[];
  rules: string[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  preferredContactTime: string;
  additionalNotes: string;
  purpose: string;
  furnishing: string;
  leaseTerms: string;

  moveInDate: string;
  petFriendly: boolean;
  availabilityStatus: string;
}
// put this helper near the top
const toLocalISODate = (d: Date) => {
  // strip time to local midnight, then format yyyy-mm-dd
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const yyyy = local.getFullYear();
  const mm = String(local.getMonth() + 1).padStart(2, '0');
  const dd = String(local.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const amenitiesList = [
  { id: 'parking', label: 'Parking', icon: '🚗' },
  { id: 'gym', label: 'Gym', icon: '🏋️‍♂️' },
  { id: 'pool', label: 'Swimming Pool', icon: '🏊' },
  { id: 'security', label: 'Security', icon: '🛡️' },
  { id: 'ac', label: 'Air Conditioning', icon: '❄️' },
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'laundry', label: 'Laundry', icon: '🧺' },
  { id: 'elevator', label: 'Elevator', icon: '🛗' },
  { id: 'balcony', label: 'Balcony', icon: '🌇' },
  { id: 'garden', label: 'Garden', icon: '🌿' },
  { id: 'playground', label: 'Playground', icon: '🎠' },
  { id: 'clubhouse', label: 'Club House', icon: '🏠' },
];

const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const AddProperty: React.FC = () => {
  const navigate = useNavigate();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [mapsApiError, setMapsApiError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PropertyFormData>({
    propertyType: 'flat',
    flatType: '1BHK',
    pgRoomType: 'shared',
    title: '',
    description: '',
    price: 0,
    address: '',
    city: '',
    state: '',
    pincode: '',
    zipcode: '',
    latitude: '',
    longitude: '',
    totalArea: 0,
    furnishedStatus: 'unfurnished',
    numRooms: 0,
    numBathrooms: 0,
    amenities: [],
    images: [],
    ownerId: '',
    isAvailable: true,
    availableFrom: '',
    depositAmount: 0,
    maintenanceCharges: 0,
    propertyAge: 0,
    facing: '',
    floorNumber: 0,
    totalFloors: 0,
    parking: '',
    waterSupply: '',
    electricity: '',
    security: '',
    nearbyPlaces: [],
    rules: [],
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    preferredContactTime: '',
    additionalNotes: '',
    purpose: 'residential',
    furnishing: 'unfurnished',
    leaseTerms: '',
    moveInDate: '',
    petFriendly: false,
    availabilityStatus: 'available',
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.userType === 'admin';

  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: "weekly",
    libraries: ["places"]
  });

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is missing. Please check your environment variables.');
      setMapsApiError(true);
      return;
    }

    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        setGoogleMapsLoaded(true);
      } else {
        setMapsApiError(true);
        toast.error('Map service unavailable. You can still enter address details manually.');
      }
    };

    script.onerror = () => {
      console.error('Google Maps API failed to load. Please check your API key and settings.');
      setMapsApiError(true);
      toast.error('Map service unavailable. You can still enter address details manually.');
    };

    document.head.appendChild(script);

    return () => {

      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);


  useEffect(() => {
    if (googleMapsLoaded && mapRef.current && !mapsApiError) {
      try {

        const defaultLocation = { lat: 20.5937, lng: 78.9629 };

        const map = new window.google.maps.Map(mapRef.current, {
          center: defaultLocation,
          zoom: 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
        });

        setMapInstance(map);


        const newMarker = new window.google.maps.Marker({
          map,
          position: defaultLocation,
          draggable: true,
        });

        setMarker(newMarker);


        if (autocompleteInputRef.current) {
          const autocomplete = new window.google.maps.places.Autocomplete(autocompleteInputRef.current);
          autocomplete.bindTo('bounds', map);

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();

            if (!place.geometry || !place.geometry.location) {
              toast.error("No details available for this place");
              return;
            }


            if (place.geometry.viewport) {
              map.fitBounds(place.geometry.viewport);
            } else {
              map.setCenter(place.geometry.location);
              map.setZoom(17);
            }


            newMarker.setPosition(place.geometry.location);


            let addressComponents = {
              address: '',
              city: '',
              state: '',
              zipcode: '',
            };

            if (place.address_components) {
              for (const component of place.address_components) {
                const componentType = component.types[0];

                switch (componentType) {
                  case 'street_number': {
                    addressComponents.address = `${component.long_name} ${addressComponents.address}`;
                    break;
                  }
                  case 'route': {
                    addressComponents.address += component.long_name;
                    break;
                  }
                  case 'locality': {
                    addressComponents.city = component.long_name;
                    break;
                  }
                  case 'administrative_area_level_1': {
                    addressComponents.state = component.long_name;
                    break;
                  }
                  case 'postal_code': {
                    addressComponents.zipcode = component.long_name;
                    break;
                  }
                }
              }
            }


            setFormData(prev => ({
              ...prev,
              address: addressComponents.address || place.formatted_address || '',
              city: addressComponents.city || '',
              state: addressComponents.state || '',
              zipcode: addressComponents.zipcode || '',
              latitude: place.geometry?.location.lat().toString() || '',
              longitude: place.geometry?.location.lng().toString() || '',


            }));
          });
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapsApiError(true);
        toast.error('Error initializing map. Please try refreshing the page.');
      }
    }
  }, [googleMapsLoaded, mapsApiError]);


  useEffect(() => {
    if (marker && formData.latitude && formData.longitude) {
      const position = new window.google.maps.LatLng(
        parseFloat(formData.latitude),
        parseFloat(formData.longitude)
      );
      marker.setPosition(position);

      if (mapInstance) {
        mapInstance.setCenter(position);
        mapInstance.setZoom(17);
      }
    }
  }, [formData.latitude, formData.longitude, marker, mapInstance]);


  useEffect(() => {
    if (marker && !mapsApiError) {
      const dragListener = marker.addListener('dragend', () => {
        const position = marker.getPosition();
        if (position) {
          setFormData(prev => ({
            ...prev,
            latitude: position.lat().toString(),
            longitude: position.lng().toString(),
          }));


          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: position }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const place = results[0];


              let addressComponents = {
                address: '',
                city: '',
                state: '',
              };

              if (place.address_components) {
                for (const component of place.address_components) {
                  const componentType = component.types[0];

                  switch (componentType) {
                    case 'street_number': {
                      addressComponents.address = `${component.long_name} ${addressComponents.address}`;
                      break;
                    }
                    case 'route': {
                      addressComponents.address += component.long_name;
                      break;
                    }
                    case 'locality': {
                      addressComponents.city = component.long_name;
                      break;
                    }
                    case 'administrative_area_level_1': {
                      addressComponents.state = component.long_name;
                      break;
                    }
                  }
                }
              }


              setFormData(prev => ({
                ...prev,
                address: addressComponents.address || place.formatted_address || prev.address,
                city: addressComponents.city || prev.city,
                state: addressComponents.state || prev.state,
              }));

              if (autocompleteInputRef.current) {
                autocompleteInputRef.current.value = place.formatted_address || '';
              }
            }
          });
        }
      });

      return () => {
        window.google.maps.event.removeListener(dragListener);
      };
    }
  }, [marker, mapsApiError]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === 'zipcode' || name === 'pincode') {
      setFormData(prev => ({
        ...prev,
        zipcode: value,
        pincode: value,
      }));
      return;
    }

    if (type === 'number') {
      const num = parseFloat(value);
      if (num < 0) return;
      setFormData(prev => ({ ...prev, [name]: num }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };


  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...filesArray],
      }));


      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);

    const updatedPreviews = [...previewImages];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);

    setFormData(prev => ({ ...prev, images: updatedImages }));
    setPreviewImages(updatedPreviews);
  };

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        return { ...prev, amenities: [...prev.amenities, amenityId] };
      } else {
        return { ...prev, amenities: prev.amenities.filter(a => a !== amenityId) };
      }
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    if (!window.google || !window.google.maps) {
      toast.error("Google Maps service is not available. Please try again later.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;


        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));


        if (mapInstance && marker) {
          const location = new window.google.maps.LatLng(latitude, longitude);
          mapInstance.setCenter(location);
          mapInstance.setZoom(17);
          marker.setPosition(location);


          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const place = results[0];


              let addressComponents = {
                address: '',
                city: '',
                state: '',
                pincode: '',
              };

              if (place.address_components) {
                for (const component of place.address_components) {
                  const componentType = component.types[0];

                  switch (componentType) {
                    case 'street_number': {
                      addressComponents.address = `${component.long_name} ${addressComponents.address}`;
                      break;
                    }
                    case 'route': {
                      addressComponents.address += component.long_name;
                      break;
                    }
                    case 'locality': {
                      addressComponents.city = component.long_name;
                      break;
                    }
                    case 'administrative_area_level_1': {
                      addressComponents.state = component.long_name;
                      break;
                    }
                    case 'postal_code': {
                      addressComponents.pincode = component.long_name;
                      break;
                    }
                  }
                }
              }


              if (!addressComponents.address) {
                addressComponents.address = place.formatted_address || '';
              }


              setFormData(prev => ({
                ...prev,
                address: addressComponents.address,
                city: addressComponents.city,
                state: addressComponents.state,
                pincode: addressComponents.pincode,
              }));


              if (autocompleteInputRef.current) {
                autocompleteInputRef.current.value = place.formatted_address || '';
              }

              toast.success("Current location captured successfully");
            } else if (status === 'ZERO_RESULTS') {
              toast.error("No address found for this location");
            } else if (status === 'OVER_QUERY_LIMIT') {
              toast.error("Geocoding service quota exceeded. Please try again later.");
            } else if (status === 'REQUEST_DENIED') {
              toast.error("Geocoding service is not authorized. Please check your API key settings.");
            } else if (status === 'INVALID_REQUEST') {
              toast.error("Invalid geocoding request. Please try again.");
            } else {
              toast.error("Error getting address details. Please try again.");
            }
          });
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location access was denied. Please enable location services.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable. Please try again.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out. Please try again.");
            break;
          default:
            toast.error("Unable to get your current location. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const handleLocationSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat().toString();
      const lng = place.geometry.location.lng().toString();
      setFormData((prev: PropertyFormData) => ({
        ...prev,
        address: place.formatted_address || '',
        latitude: lat,
        longitude: lng,
      }));
    } else {
      setError('Failed to get location coordinates');
    }
  };

  const handleMoveInDateChange = (date: Date | undefined) => {
    if (!date) return;
    setFormData((prev: PropertyFormData) => ({
      ...prev,
      moveInDate: toLocalISODate(date), // e.g., "2025-09-22"
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.moveInDate) {
      toast.error('Please pick a Move-in Date');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setShowSuccessAlert(true);

    setTimeout(() => {
      setShowSuccessAlert(false);
      navigate("/admin/property-management"); // or window.location.href
    }, 5000);

    const base64Images = await Promise.all(formData.images.map(getBase64));

    const payload = {
      propertyType: formData.propertyType,
      flatType: formData.flatType,
      pgRoomType: formData.pgRoomType,
      title: formData.title,
      description: formData.description,
      price: formData.price,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      zipcode: formData.zipcode,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      totalArea: formData.totalArea,
      furnishedStatus: formData.furnishedStatus,
      numRooms: formData.numRooms,
      numBathrooms: formData.numBathrooms,
      amenities: formData.amenities,
      // if your example really wants empty placeholders:
      // images: formData.images.map(() => ({})),
      cover_image: base64Images[0] || '',
      images: base64Images,
      ownerId: formData.ownerId,
      isAvailable: formData.isAvailable,
      // availableFrom: formData.availableFrom,
      depositAmount: formData.depositAmount,
      maintenanceCharges: formData.maintenanceCharges,
      propertyAge: formData.propertyAge,
      facing: formData.facing,
      floorNumber: formData.floorNumber,
      totalFloors: formData.totalFloors,
      parking: formData.parking,
      waterSupply: formData.waterSupply,
      electricity: formData.electricity,
      security: formData.security,
      nearbyPlaces: formData.nearbyPlaces,
      rules: formData.rules,
      contactName: formData.contactName,
      contactPhone: formData.contactPhone,
      contactEmail: formData.contactEmail,
      preferredContactTime: formData.preferredContactTime,
      additionalNotes: formData.additionalNotes,
      purpose: formData.purpose,
      furnishing: formData.furnishing,
      leaseTerms: formData.leaseTerms,
      // moveInDate: formData.moveInDate,
      petFriendly: formData.petFriendly,
      availabilityStatus: formData.availabilityStatus,
      available_from: formData.moveInDate,
      availableFrom: formData.moveInDate,
      moveInDate: formData.moveInDate,
    };

    try {
      await axios.post(
        `${API_URL}/properties/create`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'authorization': API_KEY,
            ...(token
              ? { 'Authorization': `Bearer ${token}` }
              : {}
            )
          }
        }
      );

      setShowSuccessAlert(true);                // open the modal
      setTimeout(() => {                        // optional auto-redirect
        setShowSuccessAlert(false);
        navigate("/admin/property-management");
      }, 5000);
    } catch (err: any) {
      console.error('Add property error:', err.response || err);
      const msg = err.response?.data?.message || err.message || 'Failed to add property';
      setError(msg);
      toast.error(msg); // keep your existing error toast if you like
    } finally {
      setIsSubmitting(false);
    }

  };


  const renderTypeSpecificFields = () => {
    switch (formData.propertyType) {
      case 'flat':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flatType">Flat Type</Label>
              <Select
                value={formData.flatType}
                onValueChange={(value) => handleSelectChange('flatType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select flat type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1BHK">1 BHK</SelectItem>
                  <SelectItem value="2BHK">2 BHK</SelectItem>
                  <SelectItem value="3BHK">3 BHK</SelectItem>
                  <SelectItem value="4BHK">4 BHK</SelectItem>
                  <SelectItem value="5+BHK">5+ BHK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numRooms">Number of Rooms</Label>
              <Input
                id="numRooms"
                name="numRooms"
                type="number"
                min={0}
                value={formData.numRooms || ''}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numBathrooms">Number of Bathrooms</Label>
              <Input
                id="numBathrooms"
                name="numBathrooms"
                type="number"
                min={0}
                value={formData.numBathrooms || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        );
      case 'house':
      case 'villa':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numRooms">Number of Rooms</Label>
              <Input
                id="numRooms"
                name="numRooms"
                type="number"
                min={0}
                value={formData.numRooms || ''}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numBathrooms">Number of Bathrooms</Label>
              <Input
                id="numBathrooms"
                name="numBathrooms"
                type="number"
                min={0}
                value={formData.numBathrooms || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        );
      case 'pg':
        return (
          <div className="space-y-2">
            <Label htmlFor="pgRoomType">PG Room Type</Label>
            <Select
              value={formData.pgRoomType}
              onValueChange={(value) => handleSelectChange('pgRoomType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select PG room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shared">Shared</SelectItem>
                <SelectItem value="single bed">Single Bed</SelectItem>
                <SelectItem value="2 bed">2 Bed</SelectItem>
                <SelectItem value="3 bed">3 Bed</SelectItem>
                <SelectItem value="4 bed">4 Bed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            key="success-alert"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed top-4 right-4 z-[100] rounded-md border border-yellow-200/60 dark:border-yellow-900/60 bg-yellow-50/70 dark:bg-yellow-900/20 p-3 text-sm"
          >
            <Alert className="w-[340px] border-green-200 bg-green-50">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <AlertTitle className="text-green-800">Property added</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Your property was created successfully. Redirecting…
                  </AlertDescription>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSuccess(false)}
                  aria-label="Close"
                  className="rounded p-1 hover:bg-green-100"
                >
                  <X className="h-4 w-4 text-green-700" />
                </button>
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Property</CardTitle>
          <CardDescription>
            Fill out the form below to add a new property listing.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Number</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                required
              />
            </div> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min={0}
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) => handleSelectChange('propertyType', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="pg">PG</SelectItem>
                    <SelectItem value="flatmate">Flatmate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.propertyType && renderTypeSpecificFields()}

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <RadioGroup
                value={formData.purpose}
                onValueChange={(value) => handleSelectChange('purpose', value as 'residential' | 'commercial')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="residential" id="residential" />
                  <Label htmlFor="residential">Residential</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="commercial" id="commercial" />
                  <Label htmlFor="commercial">Commercial</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="furnishing">Furnishing</Label>
              <Select
                value={formData.furnishing}
                onValueChange={(value) => handleSelectChange('furnishing', value as 'unfurnished' | 'semi-furnished' | 'fully-furnished')}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select furnishing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unfurnished">Unfurnished</SelectItem>
                  <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                  <SelectItem value="fully-furnished">Fully Furnished</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <div className="space-y-4">
                {mapsApiError ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      The map service is currently unavailable. You can still enter address details manually.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="address">Search Address</Label>
                      <div className="flex gap-2">
                        <Input
                          id="autocomplete"
                          ref={autocompleteInputRef}
                          placeholder="Enter an address or place"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={handleUseCurrentLocation}
                        >
                          <MapPin className="h-4 w-4" />
                          <span>Use Current</span>
                        </Button>
                      </div>
                    </div>

                    <div
                      ref={mapRef}
                      style={{ width: '100%', height: '300px', borderRadius: '0.5rem' }}
                      className="border"
                    ></div>
                  </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipcode">Zip Code</Label>
                    <Input
                      id="zipcode"
                      name="zipcode"
                      value={formData.zipcode || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                {!mapsApiError && formData.latitude && formData.longitude && (
                  <div className="text-sm text-muted-foreground">
                    Coordinates: {formData.latitude}, {formData.longitude}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Move-in Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.moveInDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.moveInDate
                      ? format(new Date(formData.moveInDate + 'T00:00:00'), 'PPP')
                      : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.moveInDate ? new Date(formData.moveInDate + 'T00:00:00') : undefined}
                    onSelect={handleMoveInDateChange}
                    initialFocus
                    disabled={(date) => {
                      const todayStart = new Date();
                      todayStart.setHours(0, 0, 0, 0);
                      return date < todayStart;
                    }}
                  />

                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="leaseTerms">Lease Terms</Label>
              <Textarea
                id="leaseTerms"
                name="leaseTerms"
                value={formData.leaseTerms}
                onChange={handleChange}
                placeholder="E.g., 11-month agreement, security deposit requirements, etc."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.petFriendly}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, petFriendly: checked }))}
                id="pet-friendly"
              />
              <Label htmlFor="pet-friendly">Pet Friendly</Label>
            </div>

            <div className="space-y-4">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {amenitiesList.map((amenity) => (
                  <div className="flex items-center space-x-2" key={amenity.id}>
                    <Checkbox
                      id={amenity.id}
                      checked={formData.amenities.includes(amenity.id)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity.id, checked === true)}
                    />
                    <Label htmlFor={amenity.id}>{amenity.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Images</Label>
              <div className="grid grid-cols-1 gap-4">
                <div
                  className="border-2 border-dashed rounded-md p-6 text-center hover:border-primary cursor-pointer transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload images</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG or WEBP. Max 5MB each.
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              {/* Preview images */}
              {previewImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {previewImages.map((src, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={src}
                        alt={`Preview ${index}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="availabilityStatus">Availability Status</Label>
              <Select
                value={formData.availabilityStatus}
                onValueChange={(value: any) => handleSelectChange('availabilityStatus', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select availability status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => isAdmin ? navigate('/admin/property-management') : navigate('/dashboard/property-listing')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Property'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Success
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your property has been posted successfully.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowSuccessAlert(false);
                navigate("/admin/property-management");
              }}
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

export default AddProperty; 