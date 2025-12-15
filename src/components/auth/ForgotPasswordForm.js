import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { forgotPasswordSchema } from '../../validation/schemas';
import { forgotPassword } from '../../services/authService';

const ForgotPasswordForm = () => {
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
  } = useZodForm(forgotPasswordSchema);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess(false);
      
      await forgotPassword(data.email);
      
      // Show success message
      setSuccess(true);
      toast({
        title: 'Reset link sent',
        description: 'Password reset instructions have been sent to your email',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      if (error.response?.data?.errors) {
        // Handle validation errors from the backend
        handleApiValidationErrors(error.response.data.errors, setFormError);
      } else {
        // Handle error
        setError(error.response?.data?.message || 'Unable to process your request. Please try again later.');
        
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
        <Heading>Forgot Password</Heading>
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
            Password reset instructions have been sent to your email.
          </Alert>
          <Box textAlign="center" mt={4}>
            <Button onClick={() => navigate('/auth/login')} colorScheme="blue">
              Return to Login
            </Button>
          </Box>
        </Box>
      ) : (
        <>
          <Text mt={4} textAlign="center">
            Enter your email address and we'll send you instructions to reset your password.
          </Text>
          
          <Box my={4}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={4}>
                <FormControl isInvalid={errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...register('email')}
                  />
                  <FormErrorMessage>
                    {errors.email && errors.email.message}
                  </FormErrorMessage>
                </FormControl>
                
                <Button
                  colorScheme="blue"
                  width="full"
                  mt={4}
                  type="submit"
                  isLoading={isLoading}
                >
                  Send Reset Link
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

export default ForgotPasswordForm; 