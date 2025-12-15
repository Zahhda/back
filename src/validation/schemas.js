import { z } from 'zod';

// User validation schemas
export const userSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string()
    .email('Please enter a valid email address'),
  mobileNumber: z.string()
    .regex(/^\d{10}$/, 'Mobile number must be 10 digits'),
  roleId: z.string()
    .uuid('Invalid role ID'),
  status: z.enum(['active', 'inactive', 'suspended'])
    .default('active')
    .optional()
});

export const createUserSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  mobileNumber: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const updateUserSchema = userSchema.partial();

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Property validation schemas
export const basePropertySchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  price: z.number({
    required_error: 'Price is required',
    invalid_type_error: 'Price must be a number'
  }).positive('Price must be a positive number'),
  propertyType: z.enum(['flat', 'house', 'villa', 'pg', 'flatmate'], {
    errorMap: () => ({ message: 'Property type must be flat, house, villa, pg, or flatmate' })
  }),
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),
  city: z.string()
    .min(2, 'City is required'),
  state: z.string()
    .min(2, 'State is required'),
  pincode: z.string()
    .regex(/^\d{6}$/, 'Pincode must be 6 digits')
    .optional(),
  availabilityStatus: z.enum(['available', 'rented', 'sold', 'pending'])
    .default('available')
    .optional(),
  amenities: z.array(z.string())
    .default([])
    .optional(),
  purpose: z.enum(['residential', 'commercial'])
    .default('residential')
    .optional(),
  furnishing: z.enum(['unfurnished', 'semi-furnished', 'fully-furnished'])
    .default('unfurnished')
    .optional(),
  leaseTerms: z.string()
    .optional(),
  petFriendly: z.boolean()
    .default(false)
    .optional(),
  latitude: z.string()
    .optional(),
  longitude: z.string()
    .optional(),
  moveInDate: z.string()
    .optional()
});

// Login form schema
export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
});

// Property search schema
export const searchSchema = z.object({
  keyword: z.string().optional(),
  propertyType: z.enum(['flat', 'house', 'villa', 'pg', 'flatmate', '']).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  availabilityStatus: z.enum(['available', 'rented', 'sold', 'pending', '']).optional(),
  furnishing: z.enum(['unfurnished', 'semi-furnished', 'fully-furnished', '']).optional(),
  purpose: z.enum(['residential', 'commercial', '']).optional(),
  petFriendly: z.boolean().optional()
});

// Property schemas
export const propertySchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description cannot exceed 500 characters"),
  price: z
    .string()
    .min(1, "Price is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location cannot exceed 100 characters"),
  propertyType: z
    .string()
    .min(1, "Property type is required"),
  bedrooms: z
    .string()
    .regex(/^\d+$/, "Bedrooms must be a number")
    .optional()
    .nullable(),
  bathrooms: z
    .string()
    .regex(/^\d+$/, "Bathrooms must be a number")
    .optional()
    .nullable(),
  area: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Area must be a valid number")
    .optional()
    .nullable(),
  status: z
    .string()
    .min(1, "Status is required"),
});