/// <reference types="google.maps" />

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Loader } from "@googlemaps/js-api-loader";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, MapPin, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

// import Alert from '@mui/material/Alert';
// import Button from '@mui/material/Button';
// import Stack from '@mui/material/Stack';
// import Dialog from '@mui/material/Dialog'
// import DialogTitle from '@mui/material/DialogTitle'
// import DialogContent from '@mui/material/DialogContent'
// import DialogActions from '@mui/material/DialogActions'
// import MuiButton from '@mui/material/Button'
// import CloseIcon from '@mui/icons-material/Close'
// import IconButton from '@mui/material/IconButton'
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
import { Lock, LogIn } from "lucide-react";


import {
  CheckCircle,
  FileText,
  IndianRupee,
  KeyRound,
  Send,
  Star,
} from "lucide-react";
const DRAFT_KEY = "dorpay:listPropertyDraft:v2";
const DRAFT_IMG_KEY = "dorpay:listPropertyDraftImages:v2";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}



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
type Amenity = { id: string; label: string };



const amenitiesList: Amenity[] = [
  { id: "parking", label: "Parking" },
  { id: "gym", label: "Gym" },
  { id: "pool", label: "Swimming Pool" },
  { id: "security", label: "Security" },
  { id: "ac", label: "Air Conditioning" },
  { id: "wifi", label: "WiFi" },
  { id: "laundry", label: "Laundry" },
  { id: "elevator", label: "Elevator" },
  { id: "balcony", label: "Balcony" },
  { id: "garden", label: "Garden" },
  { id: "playground", label: "Playground" },
  { id: "clubhouse", label: "Club House" },
];
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

const ListYourProperty: React.FC = () => {
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const routeLocation = useLocation();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [mapsApiError, setMapsApiError] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdmin = localStorage.getItem("role") === "admin";
  const token = localStorage.getItem('token') ?? '';
  const API_URL = import.meta.env.VITE_API_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;
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

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  const [base64Images, setBase64Images] = useState<string[]>([]);

  const isAuthenticated = Boolean(localStorage.getItem("token"));

  const handlePostClick = () => {
    if (isAuthenticated) {
      // Logged in → open your add property popup
      setShowPopup(true);
    } else {
      // Not logged in → show the login-required popup
      setShowLoginAlert(true);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    setFormData(prev => ({ ...prev, images: filesArray }));

    const base64s = await Promise.all(
      filesArray.map(getBase64)
    );
    setBase64Images(base64s);
  };
  const handleCloseDialog = () => {
    setShowLoginAlert(false)
  }
  const handleProceedToLogin = () => {
    setShowLoginAlert(false); // close popup
    navigate("/auth/login", { state: { from: routeLocation.pathname } });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
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

      cover_image: base64Images[0] || '',
      images: base64Images,
      ownerId: formData.ownerId,
      isAvailable: formData.isAvailable,
      availableFrom: formData.availableFrom,
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
      moveInDate: formData.moveInDate,
      petFriendly: formData.petFriendly,
      availabilityStatus: formData.availabilityStatus,

    };

    try {
      await axios.post(`${API_URL}/properties/create`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem(DRAFT_IMG_KEY);
      toast.success('Property added successfully');

      alert("✅ Property added successfully!");
      location.reload();
    } catch (err: any) {
      console.error('Add property error:', err.response || err);
      const msg = err.response?.data?.message || err.message || 'Failed to add property';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const autocompleteRef = useRef<HTMLInputElement>(null);


  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: "weekly",
    libraries: ["places"]
  });
  useEffect(() => {
    if (!showPopup) return;

    const saved = safeParse<Partial<PropertyFormData>>(localStorage.getItem(DRAFT_KEY), {});
    const savedImgs = safeParse<string[]>(localStorage.getItem(DRAFT_IMG_KEY), []);

    const hasAny =
      (saved && Object.keys(saved).length > 0) ||
      (savedImgs && savedImgs.length > 0);

    if (hasAny) {
      setFormData(prev => ({
        ...prev,
        ...saved,
        amenities: saved.amenities ?? prev.amenities,
        rules: saved.rules ?? prev.rules,
        nearbyPlaces: saved.nearbyPlaces ?? prev.nearbyPlaces,
        petFriendly: saved.petFriendly ?? prev.petFriendly,
      }));
      setBase64Images(savedImgs);
    }
  }, [showPopup]);
  useEffect(() => {
    const id = setTimeout(() => {
      const toSave: Partial<PropertyFormData> = {
        ...formData,
        images: [], // don’t try to save File[] in localStorage
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
      localStorage.setItem(DRAFT_IMG_KEY, JSON.stringify(base64Images));
    }, 300);

    return () => clearTimeout(id);
  }, [formData, base64Images]);

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
    const intent = localStorage.getItem("postPropertyIntent");
    if (isAuthenticated && intent === "true") {
      setShowPopup(true);
      localStorage.removeItem("postPropertyIntent");
    }
  }, [isAuthenticated]);
  useEffect(() => {
    if (showPopup) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [showPopup]);

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Select setter shared by multiple fields
  const handleSelectChange = (name: keyof PropertyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Date change for move-in date (stores yyyy-mm-dd)
  const handleMoveInDateChange = (date: Date | undefined) => {
    if (!date) return;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    setFormData((prev) => ({ ...prev, moveInDate: `${yyyy}-${mm}-${dd}` }));
  };

  // Amenities checkbox toggle
  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      amenities: checked
        ? [...new Set([...(prev.amenities || []), amenityId])]
        : (prev.amenities || []).filter((a) => a !== amenityId),
    }));
  };

  // Remove one uploaded image (base64 + file)
  const removeImage = (index: number) => {
    setBase64Images((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="overflow-x-hidden">
      <ThemeProvider defaultTheme="dark">
        <div className="min-h-screen flex flex-col bg-white dark:bg-background text-foreground w-full">
          <Navbar />

          {/* Hero Section */}

          <section
            className="
    relative w-full overflow-hidden
    /* Height scales by breakpoint */
    min-h-[12rem] sm:min-h-[14rem] md:min-h-[16rem] lg:min-h-[20rem]
    /* Subtle gradient that stays dark-mode friendly */
    bg-gradient-to-r from-gray-200/90 via-gray-400/90 to-gray-600/90
    dark:bg-gradient-to-r dark:from-black/80 dark:via-gray-800/80 dark:to-gray-700/80
    /* Padding scales by breakpoint */
    px-4 py-10 sm:px-6 sm:py-12 md:px-8 md:py-14
    flex items-center
  "
            aria-labelledby="list-your-property-heading"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 80 80"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <circle cx="0" cy="0" r="80" fill="white" fillOpacity="0.1" />
                <circle cx="80" cy="0" r="40" fill="white" fillOpacity="0.1" />
                <circle cx="80" cy="80" r="60" fill="white" fillOpacity="0.1" />
                <circle cx="0" cy="80" r="40" fill="white" fillOpacity="0.1" />
              </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto w-full max-w-6xl text-center">
              <h1
                id="list-your-property-heading"
                className="
        font-bold tracking-tight
        text-2xl sm:text-3xl md:text-4xl lg:text-5xl
        text-white
      "
              >
                List Your Property
              </h1>

              <p
                className="
        mx-auto mt-3
        max-w-[42rem]
        text-sm sm:text-base md:text-lg
        text-white/90
      "
              >
                Reach thousands of renters and buyers by listing your property with us.
              </p>
            </div>
          </section>

          {/* Why List With Us */}
          <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gray-50 dark:bg-black">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-8 sm:mb-10 text-gray-900 dark:text-white">
                Why List with Us?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[
                  {
                    icon: <Star className="text-blue-600 w-8 h-8 sm:w-9 sm:h-9 mb-3" />,
                    title: "Wide Reach",
                    desc: "Connect with a vast audience actively looking for property.",
                  },
                  {
                    icon: <CheckCircle className="text-blue-600 w-8 h-8 sm:w-9 sm:h-9 mb-3" />,
                    title: "Verified Leads",
                    desc: "We ensure only genuine interest reaches you.",
                  },
                  {
                    icon: <Send className="text-blue-600 w-8 h-8 sm:w-9 sm:h-9 mb-3" />,
                    title: "Quick Setup",
                    desc: "List your property in just a few simple steps.",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.03 }}
                    className="p-5 sm:p-6 lg:p-8 rounded-2xl shadow-lg
                     bg-white/90 dark:bg-zinc-900/90
                     border border-black/5 dark:border-white/5
                     text-left"
                  >
                    {item.icon}
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Listing Instructions */}
          <section
            id="listing"
            className="py-12 sm:py-16 md:py-16 px-4 bg-gray-50 dark:bg-gradient-to-br dark:from-black dark:via-[#0f0f0f] dark:to-black"
          >
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-2xl sm:text-4xl md:text-3xl font-semibold mb-6 sm:mb-10 text-gray-900 dark:text-white">
                Upload Your Property In{" "}
                <span className="text-3xl sm:text-5xl">3</span> Simple Steps
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
                {/* Left Column */}
                <div className="flex flex-col gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="p-4 sm:p-8 md:p-10 rounded-2xl flex flex-col justify-start"
                  >
                    <p className="text-base sm:text-2xl md:text-xl font-bold mb-4 sm:mb-8 text-left">
                      Your journey to renting or selling starts here.
                    </p>

                    <div className="space-y-4 sm:space-y-5 text-left">
                      {[
                        {
                          icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" />,
                          bg: "bg-yellow-100",
                          title: "Share Your Property Details",
                          text: "Tell us about your space, location, and key features.",
                        },
                        {
                          icon: <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />,
                          bg: "bg-green-100",
                          title: "Set Your Rent or Selling Price",
                          text: "Decide how much you’d like to earn from your property.",
                        },
                        {
                          icon: <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />,
                          bg: "bg-blue-100",
                          title: "Hand Over the Keys",
                          text: "Sit back and relax while we take care of the rest.",
                        },
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-3 sm:gap-5 min-h-[88px] sm:min-h-[100px]">
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full ${step.bg} dark:bg-white text-black`}
                          >
                            {step.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm sm:text-base leading-snug">
                              <strong className="block">{step.title}</strong>
                              {step.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Right Column */}
                <div className="shadow-lg p-4 sm:p-6 rounded-xl bg-white dark:bg-black transition-all">
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 sm:space-y-6">
                    <h2 className="text-lg sm:text-3xl font-semibold text-gray-900 dark:text-white">
                      Post Your Property
                    </h2>

                    <img
                      src="/post.jpg"
                      alt="Post Property"
                      className="w-full max-w-[16rem] sm:max-w-sm rounded-lg shadow-md object-cover"
                      loading="lazy"
                    />

                    <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
                      <AlertDialogContent className="w-[92%] sm:max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-yellow-500" />
                            Login Required
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            You need to be logged in to post your property.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.98, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="rounded-md border border-yellow-200/60 dark:border-yellow-900/60 bg-yellow-50/70 dark:bg-yellow-900/20 p-3 text-sm text-left"
                        >
                          Please login to continue.
                        </motion.div>

                        <AlertDialogFooter className="mt-2">
                          <AlertDialogCancel className="rounded-xl">Close</AlertDialogCancel>
                          <AlertDialogAction onClick={handleProceedToLogin} className="inline-flex items-center gap-2 rounded-xl">
                            <LogIn className="h-4 w-4" />
                            Login to post
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button onClick={handlePostClick} className="w-full sm:w-auto text-sm sm:text-base">
                      Post Property
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* Benefits Section */}
          <section className="py-12 sm:py-14 md:py-16 px-4 bg-gray-100 dark:bg-black dark:text-black">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-3xl dark:text-white font-semibold mb-6 sm:mb-8 md:mb-10">
                Benefits of Listing with Us
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
                {[
                  {
                    title: "Higher Visibility",
                    desc: "Your listing will be shown to a broader audience of prospective renters or buyers.",
                  },
                  {
                    title: "Security",
                    desc: "We use encryption and verification processes to ensure a safe and secure experience for both parties.",
                  },
                  {
                    title: "Expert Guidance",
                    desc: "Our team is available to assist with every step of the listing process.",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 sm:p-5 md:p-6 bg-white dark:bg-gradient-to-br dark:from-black dark:via-[#0f0f0f] dark:to-black shadow-md rounded-xl text-left"
                  >
                    <h3 className="text-lg sm:text-xl md:text-xl font-medium mb-2 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base md:text-base text-gray-600 dark:text-white">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>


          {/* Call to Action */}
          <section className="py-12 sm:py-14 md:py-16 px-4 dark:bg-gradient-to-br dark:from-black dark:via-[#0f0f0f] dark:to-black dark:text-white text-black text-center">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
            >
              Ready to List Your Property?
            </motion.h2>

            <p className="mb-5 sm:mb-6 text-base sm:text-lg md:text-lg">
              Join thousands of owners who trust us with their property listings.
            </p>

            <button
              onClick={() =>
                document.getElementById("listing")?.scrollIntoView({ behavior: "smooth" })
              }
              className="dark:bg-white bg-black dark:text-black text-white
               hover:bg-gray-300 hover:text-black
               px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-md
               text-sm sm:text-base font-medium transition-all duration-200"
            >
              Start Listing Now
            </button>
          </section>


          {/* Footer */}
          <footer className="bg-background py-12 px-6 md:px-12 border-t border-border">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <img src="/newlogo.png" alt="DORPay Logo" className="w-16 h-16" />
                <p className="text-muted-foreground max-w-md mb-6">
                  Discover the perfect property that matches your lifestyle and preferences with
                  our curated selection of premium DORPay.
                </p>
                <div className="flex space-x-4">
                  {["Twitter", "Facebook", "Instagram", "LinkedIn"].map((name) => (
                    <a
                      key={name}
                      href="#"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {name}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-4">Explore</h4>
                <ul className="space-y-2">
                  {["Properties", "Agents", "Locations", "Blog"].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-4">Contact</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Rsoultek Consulting India Pvt Ltd,</li>
                  <li>CoWrks, RMZ Ecoworld, Ground Floor Bay Area, 6A, Devarabisanahalli,</li>
                  <li>Bengaluru, Karnataka, India- 560103</li>
                  <li>
                    <a href="mailto:support@dorpay.in" className="hover:text-foreground">
                      support@dorpay.in
                    </a>
                  </li>
                  <li>
                    <a href="tel:+919844809969" className="hover:text-foreground">
                      +91 9844809969
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border text-center sm:text-left sm:flex sm:justify-between sm:items-center">
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} DORPay. All rights reserved.
              </p>
              <div className="mt-4 sm:mt-0 flex justify-center sm:justify-end space-x-6 text-sm">
                <a href="/privacy-policy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </a>
                <a href="/TermsConditions" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Cookies Policy
                </a>
              </div>
            </div>
          </footer>
        </div>
      </ThemeProvider>
      {showPopup && (
        <div
          className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center pt-14 sm:pt-24 z-50 overflow-hidden"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 dark:text-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg w-[92%] sm:w-full max-w-4xl relative overflow-y-auto max-h-[92vh] sm:max-h-[90vh] animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-center text-blue-700 text-2xl sm:text-3xl">
                  🏡 Post Your Property
                </CardTitle>
                <CardDescription className="text-center">
                  Fill out the details below to add your property
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  {/* Price + Property Type side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Price */}
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min={0}
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: Number.isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value),
                          }))
                        }
                      />
                    </div>

                    {/* Property Type */}
                    <div className="space-y-2">
                      <Label htmlFor="propertyType">Property Type</Label>
                      <Select
                        value={formData.propertyType}
                        onValueChange={(value) => handleSelectChange("propertyType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flat">Flat</SelectItem>
                          <SelectItem value="pg">PG</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="flatmate">Flatmate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>


                  {/* Flat fields */}
                  {formData.propertyType === "flat" && (
                    <>
                      <div className="mb-2 sm:mb-4">
                        <label htmlFor="flatType" className="label-style dark:text-white mb-1 sm:mb-2 block font-bold text-sm sm:text-base">
                          Flat Type
                        </label>
                        <select
                          id="flatType"
                          className="input-style bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 w-full text-sm sm:text-base"
                          value={formData.flatType}
                          onChange={(e) => setFormData((prev) => ({ ...prev, flatType: e.target.value }))}
                        >
                          <option value="">Flat Type</option>
                          <option value="1BHK">1 BHK</option>
                          <option value="2BHK">2 BHK</option>
                          <option value="3BHK">3 BHK</option>
                          <option value="4BHK">4 BHK</option>
                          <option value="5+BHK">5+ BHK</option>
                        </select>
                      </div>

                      <div className="mb-2 sm:mb-4">
                        <label htmlFor="numRooms" className="label-style dark:text-white mb-1 sm:mb-2 block font-bold text-sm sm:text-base">
                          Number of Rooms
                        </label>
                        <Input
                          id="numRooms"
                          name="numRooms"
                          type="number"
                          min={0}
                          className="input-style bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 w-full text-sm sm:text-base"
                          value={formData.numRooms || 0}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="mb-2 sm:mb-4">
                        <label htmlFor="numBathrooms" className="label-style dark:text-white mb-1 sm:mb-2 block font-bold text-sm sm:text-base">
                          Bathrooms
                        </label>
                        <input
                          id="numBathrooms"
                          type="number"
                          placeholder="Bathrooms"
                          min={0}
                          className="input-style bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 w-full text-sm sm:text-base"
                          value={formData.numBathrooms}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              numBathrooms: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    </>
                  )}

                  {/* House/Villa fields */}
                  {(formData.propertyType === "house" || formData.propertyType === "villa") && (
                    <>
                      <div className="mb-2 sm:mb-4">
                        <label htmlFor="numRooms" className="label-style dark:text-white mb-1 sm:mb-2 block font-bold text-sm sm:text-base">
                          Rooms
                        </label>
                        <input
                          id="numRooms"
                          type="number"
                          placeholder="Rooms"
                          className="input-style bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 w-full text-sm sm:text-base"
                          value={formData.numRooms}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              numRooms: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>

                      <div className="mb-2 sm:mb-4">
                        <label htmlFor="numBathrooms" className="label-style dark:text-white mb-1 sm:mb-2 block font-bold text-sm sm:text-base">
                          Bathrooms
                        </label>
                        <input
                          id="numBathrooms"
                          type="number"
                          placeholder="Bathrooms"
                          className="input-style bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 w-full text-sm sm:text-base"
                          value={formData.numBathrooms}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              numBathrooms: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    </>
                  )}

                  {/* PG */}
                  {formData.propertyType === "pg" && (
                    <div className="mb-2 sm:mb-4">
                      <label htmlFor="pgRoomType" className="label-style dark:text-white mb-1 sm:mb-2 block font-bold text-sm sm:text-base">
                        PG Room Type
                      </label>
                      <select
                        id="pgRoomType"
                        className="input-style bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 w-full text-sm sm:text-base"
                        value={formData.pgRoomType}
                        onChange={(e) => setFormData((prev) => ({ ...prev, pgRoomType: e.target.value }))}
                      >
                        <option value="">PG Room Type</option>
                        <option value="shared">Shared</option>
                        <option value="single bed">Single Bed</option>
                        <option value="2 bed">2 Bed</option>
                        <option value="3 bed">3 Bed</option>
                        <option value="4 bed">4 Bed</option>
                      </select>
                    </div>
                  )}

                  {/* Purpose */}
                  <div className="space-y-2">
                    <Label>Purpose</Label>
                    <RadioGroup
                      value={formData.purpose}
                      onValueChange={(value) => handleSelectChange("purpose", value)}
                      className="flex space-x-6"
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

                  {/* Furnishing */}
                  <div className="space-y-2">
                    <Label>Furnishing</Label>
                    <Select
                      value={formData.furnishing}
                      onValueChange={(value) => handleSelectChange("furnishing", value)}
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

                  {/* Location */}
                  <div className="space-y-2 md:col-span-2">
                    {mapsApiError ? (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 sm:p-4 rounded-md border border-yellow-200 dark:border-yellow-800 text-sm">
                        The map service is currently unavailable. You can still enter address details manually.
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="autocomplete" className="label-style dark:text-white mb-1 sm:mb-2 block font-bold text-sm sm:text-base">
                            Search Address
                          </Label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                              id="autocomplete"
                              ref={autocompleteRef}
                              placeholder="Enter an address or place"
                              className="input-style bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 flex-1 text-sm sm:text-base"
                            />
                            <Button type="button" variant="outline" className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm sm:text-base" onClick={handleUseCurrentLocation}>Use Current</span>
                            </Button>
                          </div>
                        </div>

                        <div
                          ref={mapRef}
                          style={{ width: "100%", height: "260px", borderRadius: "0.5rem" }}
                          className="border border-gray-300 dark:border-gray-700"
                        />
                      </>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                      <div className="space-y-2 md:col-span-3">
                        <Label htmlFor="address" className="label-style dark:text-white mb-1 sm:mb-2 block font-bold text-sm sm:text-base">
                          Address
                        </Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          className="input-style bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 w-full text-sm sm:text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city" className="label-style dark:text-white mb-1 sm:mb-2 block font-bold text-sm sm:text-base">
                          City
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="input-style bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 w-full text-sm sm:text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state" className="label-style dark:text-white mb-1 sm:mb-2 block font-bold text-sm sm:text-base">
                          State
                        </Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          className="input-style bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 w-full text-sm sm:text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zipcode" className="label-style dark:text-white mb-1 sm:mb-2 block font-bold text-sm sm:text-base">
                          Zip Code
                        </Label>
                        <Input
                          id="zipcode"
                          name="zipcode"
                          value={formData.zipcode || ""}
                          onChange={handleChange}
                          className="input-style bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 w-full text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    {!mapsApiError && formData.latitude && formData.longitude && (
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Coordinates: {formData.latitude}, {formData.longitude}
                      </div>
                    )}
                  </div>

                  {/* Move-in Date */}
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
                            ? new Date(formData.moveInDate + "T00:00:00").toDateString()
                            : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.moveInDate ? new Date(formData.moveInDate + "T00:00:00") : undefined}
                          onSelect={handleMoveInDateChange}
                          initialFocus
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>


                  {/* Lease Terms */}
                  <div className="space-y-2">
                    <Label htmlFor="leaseTerms">Lease Terms</Label>
                    <Textarea
                      id="leaseTerms"
                      name="leaseTerms"
                      value={formData.leaseTerms}
                      onChange={(e) => setFormData({ ...formData, leaseTerms: e.target.value })}
                      placeholder="E.g., 11-month agreement, security deposit requirements, etc."
                    />
                  </div>

                  {/* Pet Friendly */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.petFriendly}
                      onCheckedChange={(checked) => setFormData({ ...formData, petFriendly: checked })}
                      id="pet-friendly"
                    />
                    <Label htmlFor="pet-friendly">Pet Friendly</Label>
                  </div>

                  {/* Amenities */}
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

                  {/* Images */}
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

                    {base64Images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {base64Images.map((src, index) => (
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

                  {/* Availability */}
                  <div className="space-y-2">
                    <Label htmlFor="availabilityStatus">Availability Status</Label>
                    <Select
                      value={formData.availabilityStatus}
                      onValueChange={(value) => handleSelectChange("availabilityStatus", value)}
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

                  {/* Actions */}
                  <div className="md:col-span-2 flex justify-end gap-3 sm:gap-4 mt-2 sm:mt-4">
                    <button
                      onClick={() => setShowPopup(false)}
                      className="absolute top-2.5 right-3 sm:top-3 sm:right-4 text-base sm:text-lg text-gray-700 dark:text-gray-300"
                    >
                      ✕
                    </button>

                  </div>

                </CardContent>

                <CardFooter className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setShowPopup(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding…" : "Add Property"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      )
      }



    </div >
  );
};

export default ListYourProperty;
