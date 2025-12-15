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
import { loginSchema } from '../../validation/schemas';
import { login } from '../../services/authService';

const LoginForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setError: setFormError
  } = useZodForm(loginSchema);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await login(data.email, data.password);
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Show success message
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.data?.errors) {
        // Handle validation errors from the backend
        handleApiValidationErrors(error.response.data.errors, setFormError);
      } else {
        // Handle authentication error
        setError(error.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={8} maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg" bg="white">
      <Box textAlign="center">
        <Heading>Login</Heading>
      </Box>
      
      {error && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
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
            
            <FormControl isInvalid={errors.password}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="Enter your password"
                {...register('password')}
              />
              <FormErrorMessage>
                {errors.password && errors.password.message}
              </FormErrorMessage>
            </FormControl>
            
            <Button
              colorScheme="blue"
              width="full"
              mt={4}
              type="submit"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </VStack>
        </form>
      </Box>
      
      <Box textAlign="center">
        <Text>
          Forgot your password?{' '}
          <Link color="blue.500" onClick={() => navigate('/forgot-password')}>
            Reset Password
          </Link>
        </Text>
        <Text mt={2}>
          Don't have an account?{' '}
          <Link color="blue.500" onClick={() => navigate('/register')}>
            Sign Up
          </Link>
        </Text>
      </Box>
    </Box>
  );
};

export default LoginForm; 