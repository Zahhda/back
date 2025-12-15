import * as z from 'zod';

// Base property schema with common fields
const basePropertySchema = z.object({
  title: z.string()
    .min(5, { message: 'Title must be at least 5 characters' })
    .max(100, { message: 'Title must be less than 100 characters' }),
  description: z.string()
    .min(20, { message: 'Description must be at least 20 characters' })
    .max(2000, { message: 'Description must be less than 2000 characters' }),
  price: z.string()
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Price must be a non-negative number',
    }),
  propertyType: z.enum(['flat', 'house', 'villa', 'pg', 'flatmate'], {
    required_error: 'Property type is required',
  }),
  address: z.string()
    .min(5, { message: 'Address must be at least 5 characters' })
    .max(200, { message: 'Address must be less than 200 characters' }),
  city: z.string()
    .min(2, { message: 'City is required' }),
  state: z.string()
    .min(2, { message: 'State is required' }),
  zipcode: z.string()
    .regex(/^\d{6}$/, { message: 'Zipcode must be 6 digits' })
    .optional(),
  availabilityStatus: z.enum(['available', 'rented', 'sold', 'pending'])
    .default('available'),
  amenities: z.array(z.string())
    .default([]),
  purpose: z.enum(['residential', 'commercial'])
    .default('residential'),
  furnishing: z.enum(['unfurnished', 'semi-furnished', 'fully-furnished'])
    .default('unfurnished'),
  leaseTerms: z.string()
    .optional(),
  petFriendly: z.boolean()
    .default(false),
  latitude: z.string()
    .optional(),
  longitude: z.string()
    .optional(),
  moveInDate: z.date()
    .optional(),
});

// Property-type specific schemas
const flatSchema = basePropertySchema.extend({
  propertyType: z.literal('flat'),
  flatType: z.enum(['1bhk', '2bhk', '3bhk', '4bhk'])
    .optional(),
  bedrooms: z.string()
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Bedrooms must be a non-negative number',
    })
    .optional(),
  bathrooms: z.string()
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Bathrooms must be a non-negative number',
    })
    .optional(),
});

const houseSchema = basePropertySchema.extend({
  propertyType: z.literal('house'),
  numRooms: z.string()
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Number of rooms must be a non-negative number',
    })
    .optional(),
  numBathrooms: z.string()
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Number of bathrooms must be a non-negative number',
    })
    .optional(),
});

const villaSchema = basePropertySchema.extend({
  propertyType: z.literal('villa'),
  numRooms: z.string()
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Number of rooms must be a non-negative number',
    })
    .optional(),
  numBathrooms: z.string()
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Number of bathrooms must be a non-negative number',
    })
    .optional(),
});

const pgSchema = basePropertySchema.extend({
  propertyType: z.literal('pg'),
  pgRoomType: z.enum(['single', 'double', 'triple', 'sharing'])
    .optional(),
});

const flatmateSchema = basePropertySchema.extend({
  propertyType: z.literal('flatmate'),
});

// Discriminated union for property schemas
export const propertySchema = z.discriminatedUnion('propertyType', [
  flatSchema,
  houseSchema,
  villaSchema,
  pgSchema,
  flatmateSchema,
]);

// For form reset after successful submission
export const emptyPropertyFormData = {
  title: '',
  description: '',
  price: '',
  propertyType: '' as 'flat' | 'house' | 'villa' | 'pg' | 'flatmate',
  address: '',
  city: '',
  state: '',
  amenities: [],
  availabilityStatus: 'available' as const,
  leaseTerms: '',
  petFriendly: false,
  purpose: 'residential' as const,
  furnishing: 'unfurnished' as const,
}; 