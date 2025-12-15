// src/types/property.ts
// (This file is no longer imported by your components, but you can keep it or delete it.)
export interface Property {
  id: string;
  name: string;
  bedrooms: number;
  numRooms:number;
  bathrooms: number;
  full_address: string;
  area_size: number;
  totalArea: number;
  cover_image: string;
  listing_tags: string[];
  area: string;
  status: string;
  availabilityStatus:string;
  posted_on: string;
  price_from: number;
  property_type: string;
  house_type: string;
  property_id: string;
  city: string;
  state: string;
  zipcode:string;
  pincode: number;
  latitude: number;
  longitude: number;
  active: boolean;
  images_alt: {
    alt_text: string;
    filename: string;
    feature_tag: string;
  }[];
  landmark: string;
  furnish_type: string;
  url_slug: string | null;
  building_type: string;
  distance_from_landmark: number;
  is_multi_flats: boolean | null;
  multi_flat_count: number | null;
  is_balcony: boolean | null;
  pets_allowed: boolean | null;
  booking_percentage: number | null;
  balcony_count: number | null;
  why_choose_description: string | null;
  pg_for: string | null;
  user_name: string | null;
  distance: number;
  status_order: number;
  viewCount: number;
  leaseTerm: string;
}
