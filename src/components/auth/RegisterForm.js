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
  AlertIcon,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { useZodForm, handleApiValidationErrors } from '../../validation/useZodForm';
import { createUserSchema } from '../../validation/schemas';
import { register as registerUser } from '../../services/authService';

const RegisterForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setError: setFormError 
  } = useZodForm(createUserSchema);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      
      await registerUser(data);
      
      // Show success message
      toast({
        title: 'Registration successful',
        description: 'Your account has been created. Please login.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect to login
      navigate('/auth/login');
    } catch (error) {
      if (error.response?.data?.errors) {
        // Handle validation errors from the backend
        handleApiValidationErrors(error.response.data.errors, setFormError);
      } else {
        // Handle registration error
        setError(error.response?.data?.message || 'Registration failed. Please try again.');
        
        toast({
          title: 'Registration failed',
          description: error.response?.data?.message || 'An error occurred during registration',
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
    <Box p={8} maxWidth="600px" borderWidth={1} borderRadius={8} boxShadow="lg" bg="white">
      <Box textAlign="center">
        <Heading>Create an Account</Heading>
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
            <Grid templateColumns="repeat(2, 1fr)" gap={4} width="100%">
              <GridItem>
                <FormControl isInvalid={errors.firstName}>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    placeholder="Enter your first name"
                    {...register('firstName')}
                  />
                  <FormErrorMessage>
                    {errors.firstName && errors.firstName.message}
                  </FormErrorMessage>
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl isInvalid={errors.lastName}>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    placeholder="Enter your last name"
                    {...register('lastName')}
                  />
                  <FormErrorMessage>
                    {errors.lastName && errors.lastName.message}
                  </FormErrorMessage>
                </FormControl>
              </GridItem>
            </Grid>
            
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
            
            <FormControl isInvalid={errors.mobileNumber}>
              <FormLabel>Mobile Number</FormLabel>
              <Input
                placeholder="Enter your 10-digit mobile number"
                {...register('mobileNumber')}
              />
              <FormErrorMessage>
                {errors.mobileNumber && errors.mobileNumber.message}
              </FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={errors.password}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="Create a password"
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
              Register
            </Button>
          </VStack>
        </form>
      </Box>
      
      <Box textAlign="center">
        <Text mt={2}>
          Already have an account?{' '}
          <Link color="blue.500" onClick={() => navigate('/auth/login')}>
            Login
          </Link>
        </Text>
      </Box>
    </Box>
  );
};

export default RegisterForm; 