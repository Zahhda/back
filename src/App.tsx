import React from 'react';

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Login from './pages/auth/Login';
import PropertyOwnerSignup from './pages/auth/PropertyOwnerSignup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import PropertyListingDashboard from "./pages/dashboard/PropertyListingDashboard";
import PropertySearchingDashboard from "./pages/dashboard/PropertySearchingDashboard"; // File not found
import UserManagement from "./pages/admin/UserManagement";
import PropertyManagement from "./pages/admin/PropertyManagement";
import AddProperty from "./pages/properties/AddProperty";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import DashboardLayout from "./components/DashboardLayout";
import AdminLayout from "./components/AdminLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import AdminDashboardTest from "./pages/debug/AdminDashboardTest";
import AdminDashboardSimple from "./pages/debug/AdminDashboardSimple";
import AdminDirect from "./pages/admin/AdminDirect";
import SimpleAdminDashboard from "./pages/admin/SimpleAdminDashboard";
import Sidebar from "./components/Sidebar";
import RouteDebugger from "./pages/debug/RouteDebugger";
import WelcomeBanner from "./components/WelcomeBanner";
import RoleManagement from "./pages/admin/RoleManagement";
import PermissionManagement from "./pages/admin/PermissionManagement";
import RolePermissionAssignment from "./pages/admin/RolePermissionAssignment";
import PropertyDetail from "./pages/admin/PropertyDetail";
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import PayRent from './pages/payrent';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import Contact from './pages/Contact';
import PropertyListing from './pages/PropertyListing';
import PayBills from './pages/PayBills.tsx';
import TransactionHistory from './pages/dashboard/TransactionHistory.tsx';
import RentalTransaction from './pages/dashboard/RentalTransaction.tsx';
import WishlistPage from './pages/dashboard/WishlistPage';
import ViewProperty from './pages/properties/ViewProperty';
import EditProperty from './pages/properties/EditProperty';
import PropertyListingPage from '@/pages/PropertyListingPage';
import ProfilePage from './pages/dashboard/profile';
import OwnerProperties from './pages/dashboard/OwnerProperties';
import PropertyOwnerDashboard from "./pages/dashboard/PropertyOwnerDashboard";
// import PropertyWishlist from "@/components/PropertyWishlist";
const isDev = import.meta.env.DEV;
const queryClient = new QueryClient();

// Debug component that displays route information
const RouteDebug = () => {
  const { user } = useAuth();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-xs z-50">
      <div>Current Path: {window.location.pathname}</div>
      <div>User Type: {user?.userType || 'Not logged in'}</div>
      <div>User ID: {user?.id || 'N/A'}</div>
    </div>
  );
};

const App = () => (

  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <Router>
              <ScrollToTop />
              {isDev && <RouteDebug />}  {/* 👈 only once, outside <Routes> */}
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/property-owner/signup" element={<PropertyOwnerSignup />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/termsconditions" element={<TermsConditions />} />
                <Route path="/payrent" element={<PayRent />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failure" element={<PaymentFailure />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/PropertyListing" element={<PropertyListing />} />
                <Route path="/PayBills" element={<PayBills />} />
                <Route path="/properties" element={<PropertyListingPage />} />
                {/* <Route path="/PropertyWishlist" element={<PropertyWishlist />} /> */}

                {/* Debug Routes - only in development */}
                {isDev && (
                  <>
                    <Route path="/debug/admin-dashboard" element={<AdminDashboardTest />} />
                    <Route path="/debug/admin-dashboard-simple" element={<AdminDashboardSimple />} />
                    <Route path="/debug/routes" element={<RouteDebugger />} />
                    <Route path="/admin/direct" element={<AdminDirect />} />
                    <Route path="/admin/dashboard/direct" element={<SimpleAdminDashboard />} />
                  </>
                )}

                {/* Fallback Admin Dashboard Route - Direct rendering without nested layouts */}
                <Route path="/admin-fallback" element={<FallbackAdminDashboard />} />

                {/* Dashboard Layout - for authenticated users */}
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />
                  <Route path="/dashboard/MyProperties" element={<OwnerProperties />} />
                  <Route path="/dashboard/property-searching" element={<PropertySearchingDashboard />} />
                  <Route path="/dashboard/properties/:id" element={<ViewProperty />} />
                  <Route path="/dashboard/properties/edit/:id" element={<EditProperty />} />
                  <Route path="/dashboard/profile" element={<ProfilePage />} />
                  <Route path="/dashboard/WishlistPage" element={<WishlistPage />} />
                  <Route path="/dashboard/bookings" element={<UserBookings />} />
                  <Route path="/dashboard/my-reviews" element={<UserReviews />} />
                  <Route path="/dashboard/notifications" element={<UserNotifications />} />
                  <Route path="/dashboard/profile" element={<UserProfile />} />
                  <Route path="/properties/:id" element={<ViewProperty />} />
                  <Route path="/dashboard/TransactionHistory" element={<TransactionHistory />} />
                  <Route path="/dashboard/RentalTransaction" element={<RentalTransaction />} />

                  {/* Property owner dashboard routes */}
                  <Route path="/dashboard/property-listing" element={<PropertyListingDashboard />} />
                  <Route path="/dashboard/properties/add" element={<AddProperty />} />
                  <Route path="/dashboard/booking-requests" element={<BookingRequests />} />
                  <Route path="/dashboard/payments" element={<OwnerPayments />} />
                  <Route path="/dashboard/reviews" element={<OwnerReviews />} />
                  <Route path="/dashboard/subscription" element={<OwnerSubscription />} />
                  <Route path="/dashboard/MyProperties" element={<OwnerProperties />} />
                  
                </Route>

                {/* Admin Layout - for admin users only */}
                <Route element={<AdminLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/roles" element={<RoleManagement />} />
                  <Route path="/admin/permissions" element={<PermissionManagement />} />
                  <Route path="/admin/role-permissions" element={<RolePermissionAssignment />} />

                  {/* Property Management Routes */}
                  <Route path="/admin/property-management" element={<PropertyManagement />} />
                  <Route path="/admin/property-management/:propertyId" element={<PropertyDetail />} />

                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/properties/add" element={<AddProperty />} />
                  <Route path="/dashboard/properties/:id" element={<ViewProperty />} />
                  <Route path="/dashboard/properties/edit/:id" element={<EditProperty />} />
                  <Route path="/admin/owner-management" element={<OwnerManagement />} />
                  <Route path="/admin/subscription-plans" element={<SubscriptionPlans />} />
                  <Route path="/admin/payment-reports" element={<PaymentReports />} />
                  <Route path="/admin/review-management" element={<ReviewManagement />} />
                  <Route path="/admin/notifications" element={<NotificationCenter />} />
                  <Route path="/admin/cms" element={<CMSPages />} />
                  <Route path="/admin/settings" element={<SystemSettings />} />
                </Route>

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>

          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

// Component to redirect based on user type
const DashboardRedirect = () => {
  const { user } = useAuth();

  console.log('DashboardRedirect - Current user:', user);

  if (user?.userType === 'admin' || user?.userType === 'super_admin') {
    console.log('Redirecting admin to admin dashboard');
    // Try the fallback admin route instead when there might be layout issues
    return <Navigate to="/admin-fallback" />;
  } else if (user?.userType === 'property_listing') {
    console.log('Redirecting property owner to listing dashboard');
    return <Navigate to="/dashboard/property-listing" />;
  } else {
    console.log('Redirecting user to property searching dashboard');
    return <Navigate to="/dashboard/property-searching" />;
  }
};

// Placeholder components for routes we haven't created files for yet
const UserBookings = () => <div>User Bookings</div>;
const UserWishlist = () => <div>User Wishlist</div>;
const UserReviews = () => <div>User Reviews</div>;
const UserNotifications = () => <div>User Notifications</div>;
const UserProfile = () => <div>User Profile</div>;
const BookingRequests = () => <div>Booking Requests</div>;
const OwnerPayments = () => <div>Owner Payments</div>;
const OwnerReviews = () => <div>Owner Reviews</div>;
const OwnerSubscription = () => <div>Owner Subscription</div>;
const OwnerManagement = () => <div>Owner Management</div>;
const SubscriptionPlans = () => <div>Subscription Plans</div>;
const PaymentReports = () => <div>Payment Reports</div>;
const ReviewManagement = () => <div>Review Management</div>;
const NotificationCenter = () => <div>Notification Center</div>;
const CMSPages = () => <div>CMS Pages</div>;
const SystemSettings = () => <div>System Settings</div>;

// Create a FallbackAdminDashboard component
const FallbackAdminDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <WelcomeBanner />
        <div className="mt-6">
          <SimpleAdminDashboard />
        </div>
      </div>
    </div>
  );
};

export default App;
