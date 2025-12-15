import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from "@/components/theme-toggle";
import { Home, Info, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast, Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTheme } from 'next-themes';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const API_URL = import.meta.env.VITE_API_URL || "https://dorpay.in/api";
const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
async function checkAvailability(params: { email?: string; mobileNumber?: string }) {
  const qs = new URLSearchParams();
  if (params.email) qs.set("email", params.email.toLowerCase());
  if (params.mobileNumber) qs.set("mobileNumber", params.mobileNumber);

  try {
    const res = await fetch(`${API_URL}/auth/check-availability?${qs.toString()}`);
    if (!res.ok) throw new Error("availability-failed");
    return (await res.json()) as { emailTaken?: boolean; mobileTaken?: boolean };
  } catch {
    // No endpoint? We'll just return "unknown" and rely on the /auth/signup response.
    return { emailTaken: undefined, mobileTaken: undefined };
  }
}

const signupSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .regex(/^[A-Za-z]+$/, "First name must contain only letters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[A-Za-z]+$/, "Last name must contain only letters"),
  // email: z
  //   .string()
  //   .email("Please enter a valid email address"),
   email: z
    .string()
    .email("Please enter a valid email address")
    .refine((val) => {
      const domain = val.split("@")[1];
      return allowedDomains.includes(domain);
    }, {
      message: "Email domain must be Gmail, Yahoo, Outlook, or Hotmail",
    }),
  mobileNumber: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  password: z
    .string()
    .min(8, "Must be at least 8 characters")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/\d/, "Must contain number")
    .regex(/[!@#$%^&*]/, "Must contain special character")
    .regex(/^(?!.*\s).*$/, "Must not contain spaces"),
  confirmPassword: z.string(),
  userType: z.enum(["property_searching", "property_listing"], {
    required_error: "Please select a user type",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface InputFieldProps {
  label: string;
  name: keyof SignupFormData;
  type?: string;
  placeholder: string;
  register: any;
  error?: any;
  showTooltip?: boolean;
  tooltipContent?: React.ReactNode;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

const PasswordRequirement: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
  <li className={cn(
    "flex items-center gap-2 text-sm",
    met ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
  )}>
    {met ? "✓" : "×"} {text}
  </li>
);

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
  showTooltip = false,
  tooltipContent,
  onBlur,
}) => {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        {label}
        {showTooltip && tooltipContent && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Info className="inline-block w-4 h-4 ml-2 cursor-help text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="p-4 max-w-xs bg-white dark:bg-zinc-800 border dark:border-white/20"
              >
                <div className="space-y-2 text-sm">
                  {tooltipContent}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </label>
      <input
        {...register(name)}
        type={type}
        onBlur={onBlur}
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
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

const PropertyOwnerSignup: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur"
  });
  const [checking, setChecking] = useState({ email: false, mobile: false });

  const handleEmailBlur = async () => {
    const value = watch("email")?.trim();
    if (!value) return;
    setChecking(s => ({ ...s, email: true }));
    const { emailTaken } = await checkAvailability({ email: value });
    setChecking(s => ({ ...s, email: false }));
    if (emailTaken === true) {
      setError("email", { type: "validate", message: "This email is already registered." });
    }
  };

  const handleMobileBlur = async () => {
    const value = watch("mobileNumber")?.trim();
    if (!value) return;
    setChecking(s => ({ ...s, mobile: true }));
    const { mobileTaken } = await checkAvailability({ mobileNumber: value });
    setChecking(s => ({ ...s, mobile: false }));
    if (mobileTaken === true) {
      setError("mobileNumber", { type: "validate", message: "This mobile number is already registered." });
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);

      const response = await fetch(`https://dorpay.in/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400 && result.message === 'Email already registered') {
          setError('email', {
            type: 'manual',
            message: "This email is already registered. Please use a different email or sign in."
          });
          toast.error("This email is already registered", {
            duration: 5000,
            icon: <AlertCircle className="h-5 w-5 text-red-500" />,
            style: {
              borderRadius: '10px',
              background: '#fff',
              color: '#333',
              boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
              padding: '16px',
            },
          });
          return;
        }
        throw new Error(result.message || 'Signup failed');
      }

      // Save token (and user if returned)
      localStorage.setItem('token', result.token);
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      // Show success toast
      toast.success(
        <div className="flex flex-col">
          <span className="font-medium">Account created successfully!</span>
          {result.emailSent ? (
            <span className="text-sm mt-1">A welcome email has been sent to you.</span>
          ) : (
            <span className="text-sm mt-1 text-amber-600">
              Account created, but we couldn't send the email. You can still log in.
            </span>
          )}
        </div>,
        {
          duration: 5000,
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          style: {
            borderRadius: '10px',
            background: '#fff',
            color: '#333',
            boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
            padding: '16px',
          },
        }
      );
      // setTimeout(() => {
      //   navigate('/auth/login');
      // }, 2000);

      // Redirect to home 
      navigate('/', { replace: true });
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong!", {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        style: {
          borderRadius: '10px',
          background: '#fff',
          color: '#333',
          boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
          padding: '16px',
        },
      });
      console.error('Signup error:', error);
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

      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
            Sign up to get started
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {/* Name fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="First Name"
                name="firstName"
                placeholder="John"
                register={register}
                error={errors.firstName}
              />
              <InputField
                label="Last Name"
                name="lastName"
                placeholder="Doe"
                register={register}
                error={errors.lastName}
              />
            </div>

            {/* Email & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Email"
                name="email"
                type="email"
                placeholder="john@example.com"
                register={register}
                error={errors.email}
                onBlur={handleEmailBlur}
              />
              <InputField
                label="Mobile Number"
                name="mobileNumber"
                placeholder="1234567890"
                register={register}
                error={errors.mobileNumber}
                onBlur={handleMobileBlur}
              />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                register={register}
                error={errors.password}
                showTooltip
                tooltipContent={
                  <>
                    <p className="font-medium mb-2">Password Requirements:</p>
                    <ul className="space-y-1">
                      <PasswordRequirement met={/^.{8,}$/.test(watch('password') || '')} text="At least 8 characters" />
                      <PasswordRequirement met={/[a-z]/.test(watch('password') || '')} text="One lowercase letter" />
                      <PasswordRequirement met={/[A-Z]/.test(watch('password') || '')} text="One uppercase letter" />
                      <PasswordRequirement met={/\d/.test(watch('password') || '')} text="One number" />
                      <PasswordRequirement met={/[!@#$%^&*]/.test(watch('password') || '')} text="One special character" />
                      <PasswordRequirement met={!/\s/.test(watch('password') || '')} text="No spaces" />
                    </ul>
                  </>
                }
              />
              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                register={register}
                error={errors.confirmPassword}
              />
            </div>

            {/* User Type */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                User Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['property_searching', 'property_listing'].map((type) => (
                  <label
                    key={type}
                    className={cn(
                      "relative flex cursor-pointer rounded-xl border p-4 hover:border-blue-500 transition-colors duration-200",
                      watch("userType") === type
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-white/20"
                    )}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      value={type}
                      {...register("userType")}
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border",
                            watch("userType") === type
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300 dark:border-white/20"
                          )}
                        >
                          {watch("userType") === type && (
                            <div className="h-2.5 w-2.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {/* {type === 'property_searching' ? 'Property Searching' : 'Property Listing'} */}
                          {type === 'property_searching' ? 'Tenant' : 'Owner'}

                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {type === 'property_searching'
                          ? 'I want to pay bills and rent properties'
                          : 'I want to list my properties for rent'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.userType && (
                <p className="mt-1 text-sm text-red-600">{errors.userType.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="font-medium text-black dark:text-white hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyOwnerSignup;
