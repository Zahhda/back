import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    Card, CardHeader, CardTitle, CardDescription,
    CardContent, CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ArrowLeftCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://dorpay.in/api';

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
    totalArea?: number;
    petFriendly: boolean;
    availabilityStatus: string;
    numRooms: number;
    numBathrooms: number;
}

export default function EditProperty() {
    const { id: propertyId } = useParams<{ id: string }>();
    const nav = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();

    // Fetch property
    useEffect(() => {
        if (!propertyId) {
            setError('No property ID provided');
            setLoading(false);
            return;
        }
        if (!user || user.userType !== 'admin') {
            nav('/admin-fallback');
            return;
        }
        const token = localStorage.getItem('token');
        axios.get<{ properties: any[] }>(
            `${API_URL}/properties`,
            { params: { id: propertyId }, headers: { Authorization: `Bearer ${token}` } }
        )
            .then(res => {
                const p = res.data.properties.find(p => p.id === propertyId) || null;
                if (!p) {
                    setError('Property not found');
                } else {
                    setFormData({
                        id: p.id,
                        images: p.images || [],
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
                        totalArea: p.totalArea,
                        petFriendly: p.petFriendly,
                        availabilityStatus: p.availabilityStatus,
                        numRooms: p.numRooms,
                        numBathrooms: p.numBathrooms
                    });
                }
            })
            .catch(e => setError(e.response?.data?.message || e.message))
            .finally(() => setLoading(false));
    }, [propertyId, user, nav]);

    // Handlers
    const handleChange = (field: keyof Property, value: any) => {
        setFormData(prev => prev ? { ...prev, [field]: value } : prev);
    };

    const handleSubmit = async () => {
        if (!formData) return;
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            await axios.put(
                `${API_URL}/properties/${formData.id}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Property updated successfully');
            nav(-1);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    // Image upload/remove
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData || !e.target.files) return;
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => prev ? { ...prev, images: [...prev.images, reader.result as string] } : prev);
            };
            reader.readAsDataURL(file);
        });
    };
    const handleRemoveImage = (idx: number) => {
        setFormData(prev => prev ? { ...prev, images: prev.images.filter((_, i) => i !== idx) } : prev);
    };

    if (loading) return <p className="p-6 text-center">Loading…</p>;
    if (error) return <p className="p-6 text-center text-red-600">{error}</p>;
    if (!formData) return <p className="p-6 text-center">No property found.</p>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 max-w-4xl mx-auto"
        >
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <ArrowLeftCircle className="w-6 h-6 cursor-pointer text-primary" onClick={() => nav(-1)} />
                        <CardTitle>Edit Property</CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">


                    <div className="space-y-1">
                        <Label>Title</Label>
                        <Input value={formData.title} onChange={e => handleChange('title', e.target.value)} />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea value={formData.description} onChange={e => handleChange('description', e.target.value)} />
                    </div>

                    <div className="space-y-1">
                        <Label>Price (₹)</Label>
                        <Input type="number" value={formData.price} onChange={e => handleChange('price', parseInt(e.target.value))} />
                    </div>

                    <div className="space-y-1">
                        <Label>Property Type</Label>
                        <Input value={formData.propertyType} onChange={e => handleChange('propertyType', e.target.value)} />
                    </div>

                    <div className="space-y-1">
                        <Label>Flat Type</Label>
                        <Input value={formData.flatType || ''} onChange={e => handleChange('flatType', e.target.value)} />
                    </div>

                    <div className="space-y-1 relative">
  <Label className="text-black dark:text-white">Purpose</Label>
  <select
    className="
      w-full
      border
      rounded
      px-2
      py-1
      bg-transparent
      text-black dark:text-white
      appearance-none
      focus:outline-none
      focus:ring-2 focus:ring-primary
      pr-8
    "
    value={formData.purpose}
    onChange={e => handleChange('purpose', e.target.value as any)}
  >
    <option className="bg-white dark:bg-black text-black dark:text-white" value="residential">
      Residential
    </option>
    <option className="bg-white dark:bg-black text-black dark:text-white" value="commercial">
      Commercial
    </option>
  </select>
  <ChevronDown
    size={20}
    className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
  />
</div>

                    <div className="space-y-1 relative">
                        <Label className="text-black dark:text-white">Furnishing</Label>
                        <select
                            className=" w-full border rounded px-2 py-1 bg-transparent text-black dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary pr-8"
                            value={formData.furnishing}
                            onChange={e => handleChange('furnishing', e.target.value as any)}
                        >
                            <option className="bg-white dark:bg-black text-black dark:text-white" value="unfurnished">Unfurnished</option>
                            <option className="bg-white dark:bg-black text-black dark:text-white" value="semi-furnished">Semi-furnished</option>
                            <option className="bg-white dark:bg-black text-black dark:text-white" value="fully-furnished">Fully-furnished</option>
                        </select>
                        <ChevronDown
                            size={20}
                            className="pointer-events-none absolute right-2 top-2/3 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Address</Label>
                        <Input value={formData.address} onChange={e => handleChange('address', e.target.value)} />
                    </div>

                    <div className="space-y-1">
                        <Label>City</Label>
                        <Input value={formData.city} onChange={e => handleChange('city', e.target.value)} />
                    </div>

                    <div className="space-y-1">
                        <Label>State</Label>
                        <Input value={formData.state} onChange={e => handleChange('state', e.target.value)} />
                    </div>

                    <div className="space-y-1">
                        <Label>Bedrooms</Label>
                        <Input type="number" value={formData.numRooms} onChange={e => handleChange('numRooms', parseInt(e.target.value))} />
                    </div>

                    <div className="space-y-1">
                        <Label>Bathrooms</Label>
                        <Input type="number" value={formData.numBathrooms} onChange={e => handleChange('numBathrooms', parseInt(e.target.value))} />
                    </div>

                    <div className="space-y-1 flex items-center gap-2">
                        <Label>Pet Friendly</Label>
                        <Switch checked={formData.petFriendly} onCheckedChange={val => handleChange('petFriendly', val)} />
                    </div>
                    <div className="relative">
                        <select
                            className="w-full border rounded px-2 py-1 bg-transparent text-black dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary pr-8 /* space for the arrow */"
                            value={formData.availabilityStatus}
                            onChange={e => handleChange('availabilityStatus', e.target.value)}
                        >
                            <option className="bg-white dark:bg-black text-black dark:text-white" value="available">Available</option>
                            <option className="bg-white dark:bg-black text-black dark:text-white" value="rented">Rented</option>
                            <option className="bg-white dark:bg-black text-black dark:text-white" value="sold">Sold</option>
                        </select>
                        <ChevronDown
                            size={20}
                            className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                        />
                    </div>

                    {/* Image upload */}
                    <div className="md:col-span-2 space-y-1">
                        <Label>Upload Images</Label>
                        <Input type="file" multiple accept="image/*" onChange={handleImageUpload} />
                    </div>
                    {/* Editable gallery */}
                    <div className="md:col-span-2 grid grid-cols-3 gap-2">
                        {formData.images.map((src, idx) => (
                            <div key={idx} className="relative">
                                <img src={src} alt={`img-${idx + 1}`} className="w-full h-32 object-cover rounded" />
                                <button type="button" className="absolute top-1 right-1 bg-white rounded-full p-1" onClick={() => handleRemoveImage(idx)}>
                                    <X className="w-4 h-4 text-red-600" />
                                </button>
                            </div>
                        ))}
                    </div>

                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => nav(-1)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Updating…' : 'Update'}</Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
