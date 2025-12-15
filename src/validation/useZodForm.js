import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

/**
 * Custom hook to create a form with Zod validation
 * @param {object} schema - Zod schema for validation 
 * @param {object} options - Additional options for useForm
 * @returns {object} React Hook Form methods with Zod validation
 */
export const useZodForm = (schema, options = {}) => {
  return useForm({
    resolver: zodResolver(schema),
    ...options,
  });
};

/**
 * Helper function to map backend validation errors to form errors
 * @param {Array} errors - Backend validation errors array
 * @param {function} setError - React Hook Form setError function
 */
export const handleApiValidationErrors = (errors, setError) => {
  if (Array.isArray(errors)) {
    errors.forEach(error => {
      if (error.field && error.message) {
        setError(error.field, {
          type: 'server',
          message: error.message,
        });
      }
    });
  }
}; 