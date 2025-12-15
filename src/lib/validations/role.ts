import * as z from 'zod';

export const roleSchema = z.object({
  name: z.string()
    .min(2, { message: 'Role name must be at least 2 characters' })
    .max(50, { message: 'Role name must be less than 50 characters' }),
  description: z.string()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(500, { message: 'Description must be less than 500 characters' }),
  permissionIds: z.array(z.string())
    .min(1, { message: 'At least one permission must be selected' }),
  status: z.enum(['active', 'inactive'], { 
    required_error: 'Please select a status'
  }).default('active'),
});

export const editRoleSchema = roleSchema; 