import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from "@/components/theme-toggle"
import { Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTheme } from 'next-themes';
import { useLocation } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL || "https://dorpay.in/api";

const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface InputFieldProps {
  label: string;
  name: keyof LoginFormData;
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
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <input
        {...register(name)}
        type={type}
        className={cn(
          "mt-1 block w-full px-3 py-2 rounded-xl shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/50",
          "bg-white dark:bg-zinc-900",
          "text-black dark:text-white",
          error
            ? "border-red-500"
            : "border-gray-300 dark:border-white/20"
        )}
        placeholder={placeholder}
      />
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const location = useLocation();
  const from = (location.state as { from?: string } | undefined)?.from ?? "/";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur"
  });

  const onSubmit = async (data: LoginFormData) => {
    // Clear any previous errors
    setLoginError('');

    try {
      setIsLoading(true);

      let loginSuccessful = false;
      let responseData = null;

      // Try to make API request to login
      try {
        // console.log('Attempting API login with:', data.email);
        // const response = await fetch('/api/auth/login', {
        // const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        const response = await fetch(`${API_URL}/auth/login`, {

          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        });

        // console.log('Login API response status:', response.status);

        if (response.ok) {
          responseData = await response.json();
          // console.log('Login response data:', JSON.stringify(responseData, null, 2));

          if (responseData.token && responseData.user) {
            loginSuccessful = true;
            // console.log('Login successful with userType:', responseData.user.userType);
          }
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
          console.error('Login error data:', errorData);
          throw new Error(errorData.message || 'Invalid email or password');
        }
      } catch (apiError) {
        console.error('API login error:', apiError);
        // If API fails, we'll fall back to mock login
      }

      // If API login failed, use mock login for development/testing purposes
      if (!loginSuccessful) {
        // console.log('Using mock login for development');

        // Demo credentials check
        if (data.email === 'user@example.com' && data.password === 'password') {
          responseData = {
            token: 'mock-token-user',
            user: {
              id: '1',
              firstName: 'Demo',
              lastName: 'User',
              email: data.email,
              userType: 'property_searching',
              status: 'active'
            }
          };
          loginSuccessful = true;
        } else if (data.email === 'owner@example.com' && data.password === 'password') {
          responseData = {
            token: 'mock-token-owner',
            user: {
              id: '2',
              firstName: 'Demo',
              lastName: 'Owner',
              email: data.email,
              userType: 'property_listing',
              status: 'active'
            }
          };
          loginSuccessful = true;
        } else if (data.email === 'admin@example.com' && data.password === 'password') {
          responseData = {
            token: 'mock-token-admin',
            user: {
              id: '3',
              firstName: 'Demo',
              lastName: 'Admin',
              email: data.email,
              userType: 'admin',
              status: 'active'
            }
          };
          loginSuccessful = true;
        } else {
          throw new Error('Invalid email or password');
        }
      }

      // If login was successful (either via API or mock)
      if (loginSuccessful && responseData) {
        // Save token and user data to localStorage
        localStorage.setItem('token', responseData.token);
        localStorage.setItem('user', JSON.stringify(responseData.user));

        // console.log('Saved user to localStorage:', JSON.stringify(responseData.user));
        // console.log('User type for redirect:', responseData.user.userType);

        // Show success message
        toast.success("Login successful!");

        // Redirect based on user type
        if (responseData.user.userType === 'property_searching') {
          // console.log('Redirecting to property searching dashboard');
          // navigate('/dashboard', { replace: true });
          // navigate('/', { replace: true })
          navigate(from, { replace: true });
          window.location.reload();

          // window.location.reload();
        } else if (responseData.user.userType === 'property_listing') {
          // console.log('Redirecting to property listing dashboard');
          // navigate('/dashboard', { replace: true });
          // window.location.reload();
          // navigate('/', { replace: true })
          navigate(from, { replace: true });
          window.location.reload();
        } else if (
          responseData.user.userType === 'admin' ||
          responseData.user.userType === 'super_admin'
        ) {
          // console.log('Admin login successful, preparing admin navigation options');
          toast.success("Admin login successful! Choose where to go:");

          setTimeout(() => {
            const originalDestination = '/admin/dashboard';
            const fallbackDestination = '/admin-fallback';

            // console.log('Admin redirect options:', { originalDestination, fallbackDestination });

            toast(
              (t) => (
                <div className="flex flex-col gap-2">
                  <p className="font-medium">Admin Navigation Options:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        // console.log('User selected original admin dashboard');
                        // navigate(originalDestination, { replace: true });
                        // navigate('/', { replace: true })
                        navigate(from, { replace: true });
                        window.location.reload();
                      }}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
                    >
                      Regular Dashboard
                    </button>
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        // console.log('User selected fallback admin dashboard');
                        // navigate(fallbackDestination, { replace: true });
                        // window.location.reload();
                        // navigate('/', { replace: true })
                        navigate(from, { replace: true });
                        window.location.reload();
                      }}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600"
                    >
                      Fallback Dashboard
                    </button>
                  </div>
                </div>
              ),
              { duration: 10000 }
            );

            // console.log('Default navigating to fallback admin dashboard');
            // navigate(fallbackDestination, { replace: true });
            // window.location.reload();
            // navigate('/', { replace: true })
            navigate(from, { replace: true });
            window.location.reload();
          }, 500);
        } else {
          // console.log('Unknown user type, defaulting to property searching dashboard');
          // navigate('/dashboard', { replace: true });         
          // window.location.reload();
          // navigate('/', { replace: true })
          navigate(from, { replace: true });
          window.location.reload();

        }

      } else {
        throw new Error('Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Set the login error for display in the UI
      setLoginError(error instanceof Error ? error.message : "Login failed. Please try again.");
      // Also show toast notification
      toast.error(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-6 px-4 sm:px-6 lg:px-8">
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
          <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Please sign in to your account
          </p>

          {loginError && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder="john@example.com"
              register={register}
              error={errors.email}
            />

            <div className="space-y-1">
              <InputField
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                register={register}
                error={errors.password}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <input
                    {...register("rememberMe")}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 dark:border-white/20 dark:bg-zinc-900"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm font-medium text-blue-500 hover:text-blue-400"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/auth/property-owner/signup"
                className="font-medium text-black dark:text-white hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 