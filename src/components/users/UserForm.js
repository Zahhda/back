import React, { useState, useEffect } from 'react';
import { 
  Box, Button, FormControl, FormLabel, Input, Select, 
  FormErrorMessage, useToast, VStack, Heading
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useZodForm, handleApiValidationErrors } from '../../validation/useZodForm';
import { createUserSchema, updateUserSchema } from '../../validation/schemas';
import { createUser, getUserById, updateUser } from '../../services/userService';
import { getRoles } from '../../services/roleService';
import PageHeader from '@/components/PageHeader';


const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = Boolean(id);
  
  // Use the appropriate schema based on whether we're editing or creating
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    setError
  } = useZodForm(isEditMode ? updateUserSchema : createUserSchema);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);
      } catch (error) {
        toast({
          title: 'Error loading roles',
          description: error.message || 'Failed to load roles',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const loadUser = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const userData = await getUserById(id);
        reset(userData);
      } catch (error) {
        toast({
          title: 'Error loading user',
          description: error.message || 'Failed to load user',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRoles();
    if (isEditMode) {
      loadUser();
    }
  }, [id, reset, toast, isEditMode]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      if (isEditMode) {
        await updateUser(id, data);
        toast({
          title: 'User updated',
          description: 'User has been updated successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        await createUser(data);
        toast({
          title: 'User created',
          description: 'User has been created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      navigate('/users');
    } catch (error) {
      if (error.response?.data?.errors) {
        // Handle validation errors from the backend
        handleApiValidationErrors(error.response.data.errors, setError);
      } else {
        toast({
          title: isEditMode ? 'Error updating user' : 'Error creating user',
          description: error.message || 'An error occurred',
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
    <Box p={4} bg="white" borderRadius="md" shadow="md">
      <Heading size="lg" mb={6}>
        {isEditMode ? 'Edit User' : 'Create User'}
      </Heading>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4} align="flex-start">
          <FormControl isInvalid={errors.firstName}>
            <FormLabel htmlFor="firstName">First Name</FormLabel>
            <Input
              id="firstName"
              placeholder="First Name"
              {...register('firstName')}
            />
            <FormErrorMessage>
              {errors.firstName && errors.firstName.message}
            </FormErrorMessage>
          </FormControl>
          
          <FormControl isInvalid={errors.lastName}>
            <FormLabel htmlFor="lastName">Last Name</FormLabel>
            <Input
              id="lastName"
              placeholder="Last Name"
              {...register('lastName')}
            />
            <FormErrorMessage>
              {errors.lastName && errors.lastName.message}
            </FormErrorMessage>
          </FormControl>
          
          <FormControl isInvalid={errors.email}>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              placeholder="Email"
              type="email"
              {...register('email')}
            />
            <FormErrorMessage>
              {errors.email && errors.email.message}
            </FormErrorMessage>
          </FormControl>
          
          <FormControl isInvalid={errors.mobileNumber}>
            <FormLabel htmlFor="mobileNumber">Mobile Number</FormLabel>
            <Input
              id="mobileNumber"
              placeholder="Mobile Number"
              {...register('mobileNumber')}
            />
            <FormErrorMessage>
              {errors.mobileNumber && errors.mobileNumber.message}
            </FormErrorMessage>
          </FormControl>
          
          {!isEditMode && (
            <FormControl isInvalid={errors.password}>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                placeholder="Password"
                type="password"
                {...register('password')}
              />
              <FormErrorMessage>
                {errors.password && errors.password.message}
              </FormErrorMessage>
            </FormControl>
          )}
          
          <FormControl isInvalid={errors.roleId}>
            <FormLabel htmlFor="roleId">Role</FormLabel>
            <Select
              id="roleId"
              placeholder="Select role"
              {...register('roleId')}
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
            <FormErrorMessage>
              {errors.roleId && errors.roleId.message}
            </FormErrorMessage>
          </FormControl>
          
          <FormControl isInvalid={errors.status}>
            <FormLabel htmlFor="status">Status</FormLabel>
            <Select
              id="status"
              {...register('status')}
              defaultValue="active"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </Select>
            <FormErrorMessage>
              {errors.status && errors.status.message}
            </FormErrorMessage>
          </FormControl>
          
          <Box w="100%" pt={4} display="flex" justifyContent="space-between">
            <Button 
              colorScheme="gray" 
              onClick={() => navigate('/users')}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              type="submit" 
              isLoading={isLoading}
            >
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </Box>
        </VStack>
      </form>
    </Box>
  );
};

export default UserForm; 