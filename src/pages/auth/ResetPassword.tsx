import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_URL } from '@/lib/constants';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract token from URL and validate it
  useEffect(() => {
    const validateToken = async () => {
      try {
        // Extract token from URL query parameters
        const params = new URLSearchParams(location.search);
        const tokenFromUrl = params.get('token');
        
        if (!tokenFromUrl) {
          setError('Invalid password reset link. No token provided.');
          setLoading(false);
          return;
        }
        
        setToken(tokenFromUrl);
        
        console.log('Validating token:', tokenFromUrl.substring(0, 10) + '...');
        
        // Validate token with the server
        const response = await axios.get(`${API_URL}/auth/verify-reset-token`, {
          params: { token: tokenFromUrl }
        });
        
        console.log('Token validation response:', response.data);
        
        if (response.data.valid) {
          setTokenValid(true);
          setEmail(response.data.email);
          setError('');
        } else {
          setError('The password reset link is invalid or has expired');
        }
      } catch (err) {
        console.error('Token validation error:', err);
        setError('The password reset link is invalid or has expired');
      } finally {
        setLoading(false);
      }
    };
    
    validateToken();
    
    // Add a timeout to prevent infinite loading state
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Request timed out. Please try again later.');
      }
    }, 10000); // 10 seconds timeout
    
    return () => clearTimeout(loadingTimeout);
  }, [location.search, loading]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      console.log('Submitting password reset request');
      
      // Send reset password request
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        password
      });
      
      console.log('Password reset response:', response.data);
      
      setSuccess(true);
      toast.success('Password has been reset successfully');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.response?.data?.message || 'Failed to reset password');
      toast.error('Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-lg">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-muted-foreground">Verifying your reset link...</p>
          </div>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error && !tokenValid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-lg">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <h1 className="text-2xl font-bold">Invalid Reset Link</h1>
          </div>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/forgot-password')} className="w-full">
            Request a new reset link
          </Button>
        </div>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-lg">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <h1 className="text-2xl font-bold">Password Reset Successful</h1>
            <p className="text-muted-foreground">Your password has been reset successfully.</p>
            <p>Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Reset Your Password</h1>
          <p className="text-muted-foreground">Enter a new password for your account</p>
          {email && <p className="font-medium text-primary">{email}</p>}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
              minLength={6}
              disabled={submitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={6}
              disabled={submitting}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={submitting || !password || password !== confirmPassword}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting Password...
              </>
            ) : 'Reset Password'}
          </Button>
        </form>
        
        <div className="text-center text-sm">
          <a href="/auth/login" className="text-primary hover:underline">
            Return to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 