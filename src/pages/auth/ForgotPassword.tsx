import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from "@/components/theme-toggle";
import { Home, Mail, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast, Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTheme } from 'next-themes';
// import { API_URL } from '@/lib/constants';

const API_URL = import.meta.env.VITE_API_URL || "https://dorpay.in/api";
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface InputFieldProps {
  label: string;
  name: keyof ForgotPasswordFormData;
  type?: string;
  placeholder: string;
  register: any;
  error?: any;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
}) => {
  return (
    <div className="space-y-1">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        {label}
      </label>
      <input
        id={name}
        type={type}
        {...register(name)}
        className={cn(
          "block w-full rounded-lg border border-gray-300 dark:border-white/20 px-3 py-2",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "bg-white dark:bg-zinc-800",
          "text-black dark:text-white",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          error && "border-red-500 focus:ring-red-500"
        )}
        placeholder={placeholder}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error.message}</p>
      )}
    </div>
  );
};

const ForgotPassword = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur"
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      
      // Construct the URL
      const forgotPasswordUrl = `${API_URL}/auth/forgot-password`;
      console.log('Making request to:', forgotPasswordUrl, 'with data:', data.email);
      
      const response = await fetch(forgotPasswordUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      // Show success notification
      toast.success(
        <div className="flex flex-col">
          <span className="font-medium">Check your email!</span>
          <span className="text-sm mt-1">We've sent password reset instructions to {data.email}</span>
        </div>,
        {
          duration: 5000,
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          style: {
            borderRadius: '10px',
            background: '#fff',
            color: '#333',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
            padding: '16px',
          },
        }
      );
      
      // Set request sent status to true
      setRequestSent(true);
      
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.message || "Failed to send reset link. Please try again.", {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        style: {
          borderRadius: '10px',
          background: '#fff',
          color: '#333',
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
          padding: '16px',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-6 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <Link to="/">
          <Button variant="outline" size="icon" className="border-white/20">
            <Home className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <Link 
            to="/auth/login" 
            className="inline-flex items-center text-sm font-medium text-blue-500 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Login
          </Link>
          
          <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {!requestSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <InputField
                label="Email Address"
                name="email"
                type="email"
                placeholder="john@example.com"
                register={register}
                error={errors.email}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Reset Link...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reset Link
                  </div>
                )}
              </button>
            </form>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Email Sent</h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      <p>Please check your inbox for password reset instructions. The link will expire in 1 hour.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Link 
                  to="/auth/login" 
                  className="inline-flex items-center justify-center w-full py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white transition-colors duration-200"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 