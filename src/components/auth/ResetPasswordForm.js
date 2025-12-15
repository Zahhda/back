import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  FormErrorMessage,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { useZodForm, handleApiValidationErrors } from '../../validation/useZodForm';
import { resetPasswordSchema } from '../../validation/schemas';
import { resetPassword } from '../../services/authService';

const ResetPasswordForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setError: setFormError 
  } = useZodForm(resetPasswordSchema);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess(false);
      
      // Make sure passwords match
      if (data.password !== data.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      await resetPassword(token, data.password);
      
      // Show success message
      setSuccess(true);
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been reset successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // After 3 seconds, redirect to login
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (error) {
      if (error.response?.data?.errors) {
        // Handle validation errors from the backend
        handleApiValidationErrors(error.response.data.errors, setFormError);
      } else {
        // Handle error
        setError(error.response?.data?.message || 'Unable to reset password. Please try again later.');
        
        toast({
          title: 'Password reset failed',
          description: error.response?.data?.message || 'An error occurred. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={8} maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg" bg="white">
      <Box textAlign="center">
        <Heading>Reset Password</Heading>
      </Box>
      
      {error && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {success ? (
        <Box mt={6}>
          <Alert status="success">
            <AlertIcon />
            Your password has been reset successfully. You will be redirected to login page.
          </Alert>
        </Box>
      ) : (
        <>
          <Text mt={4} textAlign="center">
            Enter your new password below.
          </Text>
          
          <Box my={4}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={4}>
                <FormControl isInvalid={errors.password}>
                  <FormLabel>New Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    {...register('password')}
                  />
                  <FormErrorMessage>
                    {errors.password && errors.password.message}
                  </FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.confirmPassword}>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    {...register('confirmPassword')}
                  />
                  <FormErrorMessage>
                    {errors.confirmPassword && errors.confirmPassword.message}
                  </FormErrorMessage>
                </FormControl>
                
                <Button
                  colorScheme="blue"
                  width="full"
                  mt={4}
                  type="submit"
                  isLoading={isLoading}
                >
                  Reset Password
                </Button>
              </VStack>
            </form>
          </Box>
        </>
      )}
      
      <Box textAlign="center">
        <Text mt={2}>
          Remember your password?{' '}
          <Link color="blue.500" onClick={() => navigate('/auth/login')}>
            Login
          </Link>
        </Text>
      </Box>
    </Box>
  );
};

export default ResetPasswordForm; 