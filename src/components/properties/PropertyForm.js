import React, { useState, useEffect } from 'react';
import { 
  Box, Button, FormControl, FormLabel, Input, Select, Textarea,
  FormErrorMessage, useToast, VStack, Heading, Checkbox,
  Grid, GridItem, NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useZodForm, handleApiValidationErrors } from '../../validation/useZodForm';
import { basePropertySchema } from '../../validation/schemas';
import { createProperty, getPropertyById, updateProperty } from '../../services/propertyService';

const PropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = Boolean(id);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    setError,
    setValue,
    watch
  } = useZodForm(basePropertySchema);
  
  // Watch the property type to show/hide conditional fields
  const propertyType = watch('propertyType');

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const propertyData = await getPropertyById(id);
        
        // Reset form with the loaded data
        reset(propertyData);
        
        // Handle special fields like amenities array if needed
        if (propertyData.amenities && Array.isArray(propertyData.amenities)) {
          setValue('amenities', propertyData.amenities);
        }
      } catch (error) {
        toast({
          title: 'Error loading property',
          description: error.message || 'Failed to load property',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isEditMode) {
      loadProperty();
    }
  }, [id, reset, setValue, toast, isEditMode]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      // Convert string price to number if needed
      if (typeof data.price === 'string') {
        data.price = parseFloat(data.price);
      }
      
      if (isEditMode) {
        await updateProperty(id, data);
        toast({
          title: 'Property updated',
          description: 'Property has been updated successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        await createProperty(data);
        toast({
          title: 'Property created',
          description: 'Property has been created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      navigate('/properties');
    } catch (error) {
      if (error.response?.data?.errors) {
        // Handle validation errors from the backend
        handleApiValidationErrors(error.response.data.errors, setError);
      } else {
        toast({
          title: isEditMode ? 'Error updating property' : 'Error creating property',
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

  const renderPropertyTypeSpecificFields = () => {
    switch (propertyType) {
      case 'flat':
        return (
          <>
            <FormControl isInvalid={errors.flatType}>
              <FormLabel htmlFor="flatType">Flat Type</FormLabel>
              <Select
                id="flatType"
                placeholder="Select flat type"
                {...register('flatType')}
              >
                <option value="1bhk">1 BHK</option>
                <option value="2bhk">2 BHK</option>
                <option value="3bhk">3 BHK</option>
                <option value="4bhk">4 BHK</option>
              </Select>
              <FormErrorMessage>
                {errors.flatType && errors.flatType.message}
              </FormErrorMessage>
            </FormControl>
            
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <FormControl isInvalid={errors.bedrooms}>
                  <FormLabel htmlFor="bedrooms">Bedrooms</FormLabel>
                  <NumberInput min={0} max={10}>
                    <NumberInputField id="bedrooms" {...register('bedrooms')} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>
                    {errors.bedrooms && errors.bedrooms.message}
                  </FormErrorMessage>
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl isInvalid={errors.bathrooms}>
                  <FormLabel htmlFor="bathrooms">Bathrooms</FormLabel>
                  <NumberInput min={0} max={10}>
                    <NumberInputField id="bathrooms" {...register('bathrooms')} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>
                    {errors.bathrooms && errors.bathrooms.message}
                  </FormErrorMessage>
                </FormControl>
              </GridItem>
            </Grid>
          </>
        );
        
      case 'house':
      case 'villa':
        return (
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem>
              <FormControl isInvalid={errors.numRooms}>
                <FormLabel htmlFor="numRooms">Number of Rooms</FormLabel>
                <NumberInput min={0} max={20}>
                  <NumberInputField id="numRooms" {...register('numRooms')} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>
                  {errors.numRooms && errors.numRooms.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl isInvalid={errors.numBathrooms}>
                <FormLabel htmlFor="numBathrooms">Number of Bathrooms</FormLabel>
                <NumberInput min={0} max={10}>
                  <NumberInputField id="numBathrooms" {...register('numBathrooms')} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>
                  {errors.numBathrooms && errors.numBathrooms.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
          </Grid>
        );
        
      case 'pg':
        return (
          <FormControl isInvalid={errors.pgRoomType}>
            <FormLabel htmlFor="pgRoomType">PG Room Type</FormLabel>
            <Select
              id="pgRoomType"
              placeholder="Select PG room type"
              {...register('pgRoomType')}
            >
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
              <option value="sharing">Sharing</option>
            </Select>
            <FormErrorMessage>
              {errors.pgRoomType && errors.pgRoomType.message}
            </FormErrorMessage>
          </FormControl>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box p={4} bg="white" borderRadius="md" shadow="md">
      <Heading size="lg" mb={6}>
        {isEditMode ? 'Edit Property' : 'Create Property'}
      </Heading>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4} align="flex-start">
          <FormControl isInvalid={errors.title}>
            <FormLabel htmlFor="title">Title</FormLabel>
            <Input
              id="title"
              placeholder="Property Title"
              {...register('title')}
            />
            <FormErrorMessage>
              {errors.title && errors.title.message}
            </FormErrorMessage>
          </FormControl>
          
          <FormControl isInvalid={errors.description}>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Textarea
              id="description"
              placeholder="Property Description"
              rows={4}
              {...register('description')}
            />
            <FormErrorMessage>
              {errors.description && errors.description.message}
            </FormErrorMessage>
          </FormControl>
          
          <Grid templateColumns="repeat(2, 1fr)" gap={4} width="100%">
            <GridItem>
              <FormControl isInvalid={errors.price}>
                <FormLabel htmlFor="price">Price</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField id="price" {...register('price')} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>
                  {errors.price && errors.price.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl isInvalid={errors.propertyType}>
                <FormLabel htmlFor="propertyType">Property Type</FormLabel>
                <Select
                  id="propertyType"
                  placeholder="Select property type"
                  {...register('propertyType')}
                >
                  <option value="flat">Flat</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="pg">PG</option>
                  <option value="flatmate">Flatmate</option>
                </Select>
                <FormErrorMessage>
                  {errors.propertyType && errors.propertyType.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
          </Grid>
          
          {propertyType && renderPropertyTypeSpecificFields()}
          
          <FormControl isInvalid={errors.address}>
            <FormLabel htmlFor="address">Address</FormLabel>
            <Input
              id="address"
              placeholder="Property Address"
              {...register('address')}
            />
            <FormErrorMessage>
              {errors.address && errors.address.message}
            </FormErrorMessage>
          </FormControl>
          
          <Grid templateColumns="repeat(3, 1fr)" gap={4} width="100%">
            <GridItem>
              <FormControl isInvalid={errors.city}>
                <FormLabel htmlFor="city">City</FormLabel>
                <Input
                  id="city"
                  placeholder="City"
                  {...register('city')}
                />
                <FormErrorMessage>
                  {errors.city && errors.city.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl isInvalid={errors.state}>
                <FormLabel htmlFor="state">State</FormLabel>
                <Input
                  id="state"
                  placeholder="State"
                  {...register('state')}
                />
                <FormErrorMessage>
                  {errors.state && errors.state.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl isInvalid={errors.pincode}>
                <FormLabel htmlFor="pincode">Pincode</FormLabel>
                <Input
                  id="pincode"
                  placeholder="Pincode"
                  {...register('pincode')}
                />
                <FormErrorMessage>
                  {errors.pincode && errors.pincode.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
          </Grid>
          
          <Grid templateColumns="repeat(2, 1fr)" gap={4} width="100%">
            <GridItem>
              <FormControl isInvalid={errors.availabilityStatus}>
                <FormLabel htmlFor="availabilityStatus">Availability Status</FormLabel>
                <Select
                  id="availabilityStatus"
                  defaultValue="available"
                  {...register('availabilityStatus')}
                >
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                </Select>
                <FormErrorMessage>
                  {errors.availabilityStatus && errors.availabilityStatus.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl isInvalid={errors.furnishing}>
                <FormLabel htmlFor="furnishing">Furnishing</FormLabel>
                <Select
                  id="furnishing"
                  defaultValue="unfurnished"
                  {...register('furnishing')}
                >
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi-furnished">Semi-Furnished</option>
                  <option value="fully-furnished">Fully Furnished</option>
                </Select>
                <FormErrorMessage>
                  {errors.furnishing && errors.furnishing.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
          </Grid>
          
          <Grid templateColumns="repeat(2, 1fr)" gap={4} width="100%">
            <GridItem>
              <FormControl isInvalid={errors.purpose}>
                <FormLabel htmlFor="purpose">Purpose</FormLabel>
                <Select
                  id="purpose"
                  defaultValue="residential"
                  {...register('purpose')}
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </Select>
                <FormErrorMessage>
                  {errors.purpose && errors.purpose.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl isInvalid={errors.moveInDate}>
                <FormLabel htmlFor="moveInDate">Move-in Date</FormLabel>
                <Input
                  id="moveInDate"
                  type="date"
                  {...register('moveInDate')}
                />
                <FormErrorMessage>
                  {errors.moveInDate && errors.moveInDate.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
          </Grid>
          
          <FormControl>
            <FormLabel htmlFor="petFriendly">Pet Friendly</FormLabel>
            <Checkbox 
              id="petFriendly" 
              {...register('petFriendly')}
            >
              Allow pets
            </Checkbox>
          </FormControl>
          
          <FormControl isInvalid={errors.leaseTerms}>
            <FormLabel htmlFor="leaseTerms">Lease Terms</FormLabel>
            <Textarea
              id="leaseTerms"
              placeholder="Lease Terms and Conditions"
              rows={3}
              {...register('leaseTerms')}
            />
            <FormErrorMessage>
              {errors.leaseTerms && errors.leaseTerms.message}
            </FormErrorMessage>
          </FormControl>
          
          <Box w="100%" pt={4} display="flex" justifyContent="space-between">
            <Button 
              colorScheme="gray" 
              onClick={() => navigate('/properties')}
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

export default PropertyForm; 