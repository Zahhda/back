import * as z from 'zod';

export const userSchema = z.object({
  firstName: z.string()
    .min(2, { message: 'First name must be at least 2 characters' })
    .max(50, { message: 'First name must be less than 50 characters' }),
  lastName: z.string()
    .min(2, { message: 'Last name must be at least 2 characters' })
    .max(50, { message: 'Last name must be less than 50 characters' }),
  email: z.string()
    .email({ message: 'Please enter a valid email address' }),
  mobileNumber: z.string()
    .regex(/^\d{10}$/, { message: 'Mobile number must be 10 digits' }),
  roleId: z.string({ required_error: 'Please select a role' }),
  status: z.enum(['active', 'inactive', 'suspended'], { 
    required_error: 'Please select a status'
  }),
});

export const newUserSchema = userSchema.extend({
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(100, { message: 'Password must be less than 100 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
});

export const editUserSchema = userSchema;

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(100, { message: 'Password must be less than 100 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}); 