// src/pages/EditProperty.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, X } from 'lucide-react';

import {
    Card, CardHeader, CardTitle, CardContent, CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

/* ------------------------------------------------------------------ */
/* config                                                              */
/* ------------------------------------------------------------------ */
const API_URL = import.meta.env.VITE_API_URL || 'https://dorpay.in/api';
const API_KEY = import.meta.env.VITE_API_KEY;

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */
const toLocalISODate = (d: Date) => {
    const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const yyyy = local.getFullYear();
    const mm = String(local.getMonth() + 1).padStart(2, '0');
    const dd = String(local.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};
// Helper: detect YYYY-MM-DD
const isYYYYMMDD = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

// Helper: convert any date-like value to YYYY-MM-DD (local)
// Preserves exact input if already YYYY-MM-DD
const toYYYYMMDD = (v: unknown): string => {
    const s = String(v ?? '').trim();
    if (!s) return '';
    if (isYYYYMMDD(s)) return s; // preserve exactly as entered
    const parsed = new Date(s.replace(/\//g, '-').replace(' ', 'T'));
    if (isNaN(parsed.getTime())) return '';
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const toArray = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.filter(Boolean) as string[];
    if (typeof v === 'string') {
        try {
            const parsed = JSON.parse(v);
            if (Array.isArray(parsed)) return parsed.filter(Boolean) as string[];
        } catch { /* ignore */ }
        return v.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
};

const pick = (o: any, keys: string[], fallback: any = ''): any => {
    for (const k of keys) {
        const v = o?.[k];
        // treat undefined, null, and empty/whitespace strings as "not set"
        if (v !== undefined && v !== null && String(v).trim() !== '') return v;
    }
    return fallback;
};

const normalizeDateStr = (v: unknown): string => {
    if (!v) return '';
    const s = String(v).trim();
    if (!s) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const d = new Date(s);
    return isNaN(d.getTime()) ? '' : toLocalISODate(d);
};

/* ------------------------------------------------------------------ */
/* constants                                                           */
/* ------------------------------------------------------------------ */
const amenitiesList = [
    { id: 'parking', label: 'Parking' },
    { id: 'gym', label: 'Gym' },
    { id: 'pool', label: 'Swimming Pool' },
    { id: 'security', label: 'Security' },
    { id: 'ac', label: 'Air Conditioning' },
    { id: 'wifi', label: 'WiFi' },
    { id: 'laundry', label: 'Laundry' },
    { id: 'elevator', label: 'Elevator' },
    { id: 'balcony', label: 'Balcony' },
    { id: 'garden', label: 'Garden' },
    { id: 'playground', label: 'Playground' },
    { id: 'clubhouse', label: 'Club House' },
];

/* ------------------------------------------------------------------ */
/* types                                                               */
/* ------------------------------------------------------------------ */
interface Property {
    id: string;
    images: string[];
    title: string;
    description: string;
    price: number;
    propertyType: string;
    flatType?: string;
    purpose: 'residential' | 'commercial';
    furnishing: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
    address: string;
    city: string;
    state: string;
    zipcode: string;
    pincode: string;
    totalArea?: number;
    petFriendly: boolean;
    availabilityStatus: string;
    numRooms: number;
    numBathrooms: number;
    moveInDate: string;      // YYYY-MM-DD
    leaseTerms?: string;

    amenities: string[];
}

/* ------------------------------------------------------------------ */
/* mappers                                                             */
/* ------------------------------------------------------------------ */
const mapFromApi = (raw: any): Property => {
    const rawDate = pick(raw, [
        'moveInDate', 'move_in_date',
        'availableFrom', 'available_from',
        'movingDate', 'move_inDate', 'moveinDate',
        'availableDate', 'available_date',
        'availabilityFrom', 'availability_from'
    ], '');
    console.debug('[EditProperty] raw record from API:', raw);
    console.debug('[EditProperty] date fields seen:', {
        moveInDate: raw?.moveInDate,
        move_in_date: raw?.move_in_date,
        availableFrom: raw?.availableFrom,
        available_from: raw?.available_from,
        movingDate: raw?.movingDate,
        availableDate: raw?.availableDate,
    });
    const moveInDate = toYYYYMMDD(rawDate); 
    const leaseTerms = pick(
        raw,
        ['leaseTerms', 'leaseTerm', 'lease_terms', 'lease_term', 'lease', 'terms'],
        ''
    );
    const amenities = toArray(pick(raw, ['amenities', 'amenity_list', 'features', 'amenity'], []));
    const isYYYYMMDD = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
    return {
        id: raw.id ?? raw._id ?? raw.propertyId ?? '',
        images: Array.isArray(raw.images) ? raw.images : [],
        title: raw.title || '',
        description: raw.description || '',
        price: Number(raw.price ?? raw.price_from ?? 0) || 0,
        propertyType: raw.propertyType ?? raw.property_type ?? '',
        flatType: raw.flatType ?? raw.house_type ?? undefined,
        purpose: (raw.purpose as 'residential' | 'commercial') || 'residential',
        furnishing:
            (raw.furnishing as 'unfurnished' | 'semi-furnished' | 'fully-furnished') ||
            (raw.furnish_type as any) ||
            'unfurnished',
        address: raw.address || raw.full_address || '',
        city: raw.city || '',
        state: raw.state || '',
        zipcode: raw.zipcode || '',
        pincode: raw.pincode || '',

        totalArea: raw.totalArea !== undefined ? Number(raw.totalArea) : (raw.area_size ? Number(raw.area_size) : undefined),
        petFriendly: Boolean(raw.petFriendly ?? raw.pets_allowed ?? false),
        availabilityStatus: raw.availabilityStatus ?? raw.status ?? 'available',
        numRooms: Number(raw.numRooms ?? raw.bedrooms ?? 0) || 0,
        numBathrooms: Number(raw.numBathrooms ?? raw.bathrooms ?? 0) || 0,
        moveInDate,
        leaseTerms,
        amenities,
    };
};

const mapToApi = (p: Property) => ({
    id: p.id,
    images: p.images,
    title: p.title,
    description: p.description,
    price: p.price,
    propertyType: p.propertyType,
    flatType: p.flatType,
    purpose: p.purpose,
    furnishing: p.furnishing,
    address: p.address,
    city: p.city,
    state: p.state,
    zipcode: p.zipcode,
    pincode: p.pincode,
    totalArea: p.totalArea,
    petFriendly: p.petFriendly,
    availabilityStatus: p.availabilityStatus,
    numRooms: p.numRooms,
    numBathrooms: p.numBathrooms,

    // write with multiple aliases just in case the backend expects a specific one
    moveInDate: p.moveInDate,
    move_in_date: p.moveInDate,
    availableFrom: p.moveInDate,
    available_from: p.moveInDate,


    leaseTerms: p.leaseTerms ?? '',
    lease_terms: p.leaseTerms ?? '',
    leaseTerm: p.leaseTerms ?? '',

    amenities: p.amenities ?? [],
});

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */
export default function EditProperty() {
    const { id: propertyId } = useParams<{ id: string }>();
    const nav = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();

    useEffect(() => {
        const fetchData = async () => {
            if (!propertyId) {
                setError('No property ID provided');
                setLoading(false);
                return;
            }

            const token = localStorage.getItem('token') || '';
            const headers = {
                Authorization: `Bearer ${token}`,
                ...(API_KEY ? { authorization: API_KEY as string } : {}),
                'Cache-Control': 'no-cache',
            };

            try {
                // single, working request (list endpoint with id)
                const res = await axios.get<{ properties?: any[] }>(
                    `${API_URL}/properties`,
                    { params: { id: propertyId, _: Date.now() }, headers }
                );

                const list = res.data?.properties || [];

                const want = String(propertyId).toLowerCase();
                const wantNoHyphen = want.replace(/-/g, '');

                const getId = (p: any) =>
                    String(p?.id ?? p?._id ?? p?.uuid ?? p?.propertyId ?? '').toLowerCase();
                const raw =
                    list.find(p => {
                        const pid = getId(p);
                        return pid === want || pid === wantNoHyphen;
                    }) || null;

                if (!raw) {
                    setError('Property not found');
                } else {
                    setFormData(mapFromApi(raw));
                }
            } catch (e: any) {
                setError(e.response?.data?.message || e.message || 'Failed to fetch property');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [propertyId]);


    const handleChange = <K extends keyof Property>(field: K, value: Property[K]) => {
        setFormData(prev => (prev ? { ...prev, [field]: value } : prev));
    };
    const toYYYYMMDD = (v: unknown): string => {
        const s = String(v ?? '').trim();
        if (isYYYYMMDD(s)) return s;
        const d = new Date(s.replace(/\//g, '-').replace(' ', 'T'));
        if (isNaN(d.getTime())) return '';
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    const handleSelect = <K extends keyof Property>(field: K) => (value: string) => {
        setFormData(prev => (prev ? { ...prev, [field]: value as any } : prev));
    };

    const handleMoveInDateChange = (date: Date | undefined) => {
        if (!date) return;
        handleChange('moveInDate', toLocalISODate(date));
    };

    const handleAmenityToggle = (id: string, checked: boolean) => {
        setFormData(prev => {
            if (!prev) return prev;
            const prevA = Array.isArray(prev.amenities) ? prev.amenities : [];
            const next = checked ? [...new Set([...prevA, id])] : prevA.filter(a => a !== id);
            return { ...prev, amenities: next };
        });
    };

    const handleSubmit = async () => {
        if (!formData) return;
        setLoading(true);
        const token = localStorage.getItem('token') || '';
        try {
            await axios.put(`${API_URL}/properties/${formData.id}`, mapToApi(formData), {
                headers: {
                    Authorization: `Bearer ${token}`,
                    ...(API_KEY ? { authorization: API_KEY as string } : {}),
                },
            });
            toast.success('Property updated successfully');
            nav(-1);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData || !e.target.files) return;
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev =>
                    prev ? { ...prev, images: [...prev.images, reader.result as string] } : prev
                );
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (idx: number) => {
        setFormData(prev =>
            prev ? { ...prev, images: prev.images.filter((_, i) => i !== idx) } : prev
        );
    };

    if (loading) return <p className="p-6 text-center">Loading…</p>;
    if (error) return <p className="p-6 text-center text-red-600">{error}</p>;
    if (!formData) return <p className="p-6 text-center">No property found.</p>;
    const dateObj = (() => {
        const s = formData.moveInDate?.trim();
        if (!s) return undefined;
        const isoish = s.length > 10 ? s.replace(' ', 'T') : `${s}T00:00:00`;
        const d = new Date(isoish);
        return isNaN(d.getTime()) ? undefined : d;
    })();


    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 md:p-6 max-w-4xl mx-auto"
        >
            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg md:text-xl">Edit Property</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            className="h-10"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            className="min-h-[120px]"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                    </div>

                    {/* Price + Property Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Price (₹)</Label>
                            <Input
                                type="number"
                                className="h-10"
                                value={formData.price}
                                onChange={(e) =>
                                    handleChange('price', parseInt(e.target.value || '0', 10))
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Property Type</Label>
                            <Select
                                value={formData.propertyType}
                                onValueChange={handleSelect('propertyType')}
                            >
                                <SelectTrigger className="h-10">
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

                    {/* Flat Type + Total Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Flat Type</Label>
                            <Input
                                className="h-10"
                                value={formData.flatType || ''}
                                onChange={(e) => handleChange('flatType', e.target.value)}
                            />
                        </div>
                        {/* Beds + Baths + Pet Friendly */}
                        <div className="grid grid-cols-1 ">
                            <div className="space-y-2">
                                <Label>Bedrooms</Label>
                                <Input
                                    type="number"
                                    className="h-10"
                                    value={formData.numRooms}
                                    onChange={(e) =>
                                        handleChange('numRooms', parseInt(e.target.value || '0', 10))
                                    }
                                />
                            </div>




                        </div>
                        <div className="space-y-2">
                            <Label>Bathrooms</Label>
                            <Input
                                type="number"
                                className="h-10"
                                value={formData.numBathrooms}
                                onChange={(e) =>
                                    handleChange('numBathrooms', parseInt(e.target.value || '0', 10))
                                }
                            />
                        </div>
                        {/* <div className="space-y-2">
                            <Label>Total Area (sq ft)</Label>
                            <Input
                                type="number"
                                className="h-10"
                                value={formData.totalArea ?? 0}
                                onChange={(e) =>
                                    handleChange('totalArea', parseInt(e.target.value || '0', 10))
                                }
                            />
                        </div> */}
                    </div>

                    {/* Purpose + Furnishing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Purpose</Label>
                            <Select value={formData.purpose} onValueChange={handleSelect('purpose')}>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select purpose" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="residential">Residential</SelectItem>
                                    <SelectItem value="commercial">Commercial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                    </div>
                    <div className="space-y-2">
                        <Label>Furnishing</Label>
                        <Select
                            value={formData.furnishing}
                            onValueChange={handleSelect('furnishing')}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select furnishing" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unfurnished">Unfurnished</SelectItem>
                                <SelectItem value="semi-furnished">Semi-furnished</SelectItem>
                                <SelectItem value="fully-furnished">Fully-furnished</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Address, City, State, Availability */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Label>Location</Label>
                        <div className="space-y-2 md:col-span-3">
                            <Label>Address</Label>
                            <Input
                                className="h-10"
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>City</Label>
                            <Input
                                className="h-10"
                                value={formData.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>State</Label>
                            <Input
                                className="h-10"
                                value={formData.state}
                                onChange={(e) => handleChange('state', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>zipcode</Label>
                            <Input
                                className="h-10"
                                value={formData.pincode}
                                onChange={(e) => handleChange('pincode', e.target.value)}
                            />
                        </div>

                    </div>



                    {/* Move-in Date */}
                    <div className="space-y-2">
                        <Label>Move-in Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal h-10',
                                        !formData.moveInDate && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateObj ? format(dateObj, 'PPP') : 'Pick a date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={dateObj}
                                    onSelect={handleMoveInDateChange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Lease Terms */}
                    <div className="space-y-2">
                        <Label>Lease Terms</Label>
                        <Textarea
                            className="min-h-[100px]"
                            placeholder="E.g., 11-month agreement, deposit details, etc."
                            value={formData.leaseTerms || ''}
                            onChange={(e) => handleChange('leaseTerms', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 flex items-center ">
                        <Label className="mt-1">Pet Friendly</Label>
                        <Switch
                            checked={formData.petFriendly}
                            onCheckedChange={(val) => handleChange('petFriendly', val)}
                        />
                    </div>
                    {/* Amenities */}
                    <div className="space-y-3">
                        <Label>Amenities</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {amenitiesList.map((a) => (
                                <div key={a.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`amenity-${a.id}`}
                                        checked={(formData.amenities || []).includes(a.id)}
                                        onCheckedChange={(checked) =>
                                            handleAmenityToggle(a.id, checked === true)
                                        }
                                    />
                                    <Label htmlFor={`amenity-${a.id}`}>{a.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-2">
                        <Label>Upload Images</Label>
                        <Input type="file" multiple accept="image/*" onChange={handleImageUpload} />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            {formData.images.map((src, idx) => (
                                <div key={idx} className="relative">
                                    <img
                                        src={src}
                                        alt={`img-${idx + 1}`}
                                        className="w-full h-32 object-cover rounded"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                                        onClick={() => handleRemoveImage(idx)}
                                    >
                                        <X className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Availability</Label>
                        <Select
                            value={formData.availabilityStatus}
                            onValueChange={handleSelect('availabilityStatus')}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select availability" />
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
                    <Button variant="outline" onClick={() => nav(-1)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Updating…' : 'Update'}
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
