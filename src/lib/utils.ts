import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names together and handles Tailwind class conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency (INR by default)
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Safely capitalize the first letter of a string
 */
// export function capitalizeFirstLetter(str: string | null | undefined): string {
//   if (!str) return 'Unknown';
//   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
// }

export function capitalizeFirstLetter(str: string | null | undefined): string {
  if (!str) return 'Unknown';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
