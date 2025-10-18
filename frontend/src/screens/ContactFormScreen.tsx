import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { submitContactForm } from '@/utils/api';

interface FormData {
  userName: string;
  phoneNumber: string;
  email: string;
  address: string;
  licenseNumber: string;
  licenseType: string;
  resourceType: string;
  resourceName: string;
  resourceAddress: string;
  location: {
    coordinates: [number, number];
  };
  contactNumber: string;
  alternateContact: string;
  websiteUrl: string;
  openTime: string;
  closeTime: string;
  operatingDays: string[];
  is24Hours: boolean;
  services: string[];
  languages: string[];
  wheelchairAccessible: boolean;
  parkingAvailable: boolean;
  description: string;
  message: string;
}

interface ContactFormScreenProps {
  onClose?: () => void;
}

export default function ContactFormScreen({ onClose }: ContactFormScreenProps) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceInput, setServiceInput] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const [formData, setFormData] = useState<FormData>({
    userName: '',
    phoneNumber: '',
    email: '',
    address: '',
    licenseNumber: '',
    licenseType: 'medical',
    resourceType: 'clinic',
    resourceName: '',
    resourceAddress: '',
    location: { coordinates: [0, 0] },
    contactNumber: '',
    alternateContact: '',
    websiteUrl: '',
    openTime: '',
    closeTime: '',
    operatingDays: [],
    is24Hours: false,
    services: [],
    languages: [],
    wheelchairAccessible: false,
    parkingAvailable: false,
    description: '',
    message: ''
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear the error for a field when the user starts typing in it
    if (errors[field as keyof FormData]) {
      setErrors(prevErrors => ({ ...prevErrors, [field]: undefined }));
    }
  };

  const toggleArrayItem = (field: 'operatingDays' | 'services' | 'languages', item: string) => {
    setFormData(prev => {
      const array = prev[field];
      const exists = array.includes(item);
      return {
        ...prev,
        [field]: exists ? array.filter(i => i !== item) : [...array, item]
      };
    });
  };

  const addService = (service: string) => {
    if (service.trim()) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, service.trim()]
      }));
      setServiceInput('');
    }
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      updateFormData('location', {
        coordinates: [location.coords.longitude, location.coords.latitude]
      });
      Alert.alert('Success', 'Location captured successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-])\/?$/;

    switch (step) {
      case 1:
        if (!formData.userName) newErrors.userName = 'Full Name is required.';
        if (!formData.address) newErrors.address = 'Address is required.';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone Number is required.';
        else if (!phoneRegex.test(formData.phoneNumber)) newErrors.phoneNumber = 'Please enter a valid phone number.';
        if (formData.email && !emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email address.';
        break;
      case 2:
        if (!formData.resourceName) newErrors.resourceName = 'Resource Name is required.';
        if (!formData.resourceAddress) newErrors.resourceAddress = 'Resource Address is required.';
        if (formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0) {
          newErrors.location = 'Please capture the location.';
        }
        break;
      case 3:
        if (!formData.contactNumber) newErrors.contactNumber = 'Contact Number is required.';
        else if (!phoneRegex.test(formData.contactNumber)) newErrors.contactNumber = 'Please enter a valid contact number.';
        if (formData.websiteUrl && !urlRegex.test(formData.websiteUrl)) newErrors.websiteUrl = 'Please enter a valid website URL.';
        break;
      default:
        break;
    }

    setErrors(prevErrors => ({ ...prevErrors, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      // Clear errors from the current step before moving to the next
      const stepFields = {
        1: ['userName', 'phoneNumber', 'email', 'address'] as (keyof FormData)[],
        2: ['resourceName', 'resourceAddress', 'location'] as (keyof FormData)[],
        3: ['contactNumber', 'websiteUrl'] as (keyof FormData)[],
      }[currentStep] || [];
      const clearedErrors = { ...errors };
      stepFields.forEach(field => delete clearedErrors[field]);
      setErrors(clearedErrors);
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
const handleSubmit = async () => {
    // Validate all steps before submitting to catch any errors on previous pages
    const isStep1Valid = validateStep(1);
    const isStep2Valid = validateStep(2);
    const isStep3Valid = validateStep(3);
    const isStep4Valid = validateStep(4); // Currently has no validation, but good practice

    if (!isStep1Valid || !isStep2Valid || !isStep3Valid || !isStep4Valid) return;

    setLoading(true);
    try {
        const payload = {
            // All form data fields from the state
            userName: formData.userName,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            address: formData.address,
            licenseNumber: formData.licenseNumber,
            licenseType: formData.licenseType,
            resourceType: formData.resourceType,
            resourceName: formData.resourceName,
            resourceAddress: formData.resourceAddress,
            // Ensure location structure matches backend expectation (coordinates: [lon, lat])
            location: {
                coordinates: [formData.location.coordinates[0], formData.location.coordinates[1]]
            },
            contactNumber: formData.contactNumber,
            alternateContact: formData.alternateContact,
            websiteUrl: formData.websiteUrl,
            openTime: formData.openTime,
            closeTime: formData.closeTime,
            operatingDays: formData.operatingDays,
            is24Hours: formData.is24Hours,
            services: formData.services,
            languages: formData.languages,
            wheelchairAccessible: formData.wheelchairAccessible,
            parkingAvailable: formData.parkingAvailable,
            description: formData.description,
            message: formData.message
        };

        // Use the utility function instead of inline fetch
        const data = await submitContactForm(payload); 

        // Assuming submitContactForm throws an error on non-2xx status
        Alert.alert(
            'Success',
            'Your submission has been received. We will review it shortly.',
            [{ text: 'OK', onPress: onClose || (() => navigation.goBack()) }]
        );
        
    } catch (error: any) {
        let errorMessage = 'An unexpected error occurred. Please try again.';
        // Axios-specific error handling
        if (error.response) {
          const responseData = error.response.data;
          if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
            const firstError = responseData.errors[0];
            errorMessage = firstError.msg; // Use the first error for the main alert

            // Set specific field errors from the backend response
            const backendErrors: Partial<Record<keyof FormData, string>> = {};
            responseData.errors.forEach((err: { param: keyof FormData, msg: string }) => {
              if (err.param) {
                backendErrors[err.param] = err.msg;
              }
            });
            setErrors(prev => ({ ...prev, ...backendErrors }));
          } else if (responseData.message) {
            errorMessage = responseData.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        Alert.alert('Error', errorMessage);
    } finally {
        setLoading(false);
    }
};

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map(step => (
        <View key={step} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            currentStep >= step && styles.stepCircleActive
          ]}>
            <Text style={[
              styles.stepText,
              currentStep >= step && styles.stepTextActive
            ]}>{step}</Text>
          </View>
          {step < 4 && <View style={[
            styles.stepLine,
            currentStep > step && styles.stepLineActive
          ]} />}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.userName}
          onChangeText={(text) => updateFormData('userName', text)}
          placeholder="Enter your full name"
        />
        {errors.userName && <Text style={styles.errorText}>{errors.userName}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.phoneNumber}
          onChangeText={(text) => updateFormData('phoneNumber', text)}
          placeholder="+91 1234567890"
          keyboardType="phone-pad"
        />
        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => updateFormData('email', text)}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.address}
          onChangeText={(text) => updateFormData('address', text)}
          placeholder="Enter your complete address"
          multiline
          numberOfLines={3}
        />
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>License Number</Text>
        <TextInput
          style={styles.input}
          value={formData.licenseNumber}
          onChangeText={(text) => updateFormData('licenseNumber', text)}
          placeholder="Enter license number"
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>License Type</Text>
        <View style={styles.pickerContainer}>
          {['medical', 'pharmacy', 'clinic', 'other'].map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chipButton,
                formData.licenseType === type && styles.chipButtonActive
              ]}
              onPress={() => updateFormData('licenseType', type)}
            >
              <Text style={[
                styles.chipText,
                formData.licenseType === type && styles.chipTextActive
              ]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Resource Information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Resource Type *</Text>
        <View style={styles.pickerContainer}>
          {['clinic', 'pharmacy', 'blood_bank', 'other'].map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chipButton,
                formData.resourceType === type && styles.chipButtonActive
              ]}
              onPress={() => updateFormData('resourceType', type)}
            >
              <Text style={[
                styles.chipText,
                formData.resourceType === type && styles.chipTextActive
              ]}>
                {type === 'blood_bank' ? 'Blood Bank' : type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Resource Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.resourceName}
          onChangeText={(text) => updateFormData('resourceName', text)}
          placeholder="E.g., City Medical Clinic"
        />
        {errors.resourceName && <Text style={styles.errorText}>{errors.resourceName}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Resource Address *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.resourceAddress}
          onChangeText={(text) => updateFormData('resourceAddress', text)}
          placeholder="Enter complete address"
          multiline
          numberOfLines={3}
        />
        {errors.resourceAddress && <Text style={styles.errorText}>{errors.resourceAddress}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Location *</Text>
        <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
          <Ionicons name="location" size={20} color="#2563eb" />
          <Text style={styles.locationButtonText}>
            {formData.location.coordinates[0] !== 0 
              ? `${formData.location.coordinates[1].toFixed(4)}, ${formData.location.coordinates[0].toFixed(4)}`
              : 'Capture Current Location'}
          </Text>
        </TouchableOpacity>
        {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => updateFormData('description', text)}
          placeholder="Brief description about the resource"
          multiline
          numberOfLines={4}
          maxLength={1000}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Contact & Operating Hours</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Contact Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.contactNumber}
          onChangeText={(text) => updateFormData('contactNumber', text)}
          placeholder="+91 1234567890"
          keyboardType="phone-pad"
        />
        {errors.contactNumber && <Text style={styles.errorText}>{errors.contactNumber}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Alternate Contact</Text>
        <TextInput
          style={styles.input}
          value={formData.alternateContact}
          onChangeText={(text) => updateFormData('alternateContact', text)}
          placeholder="+91 0987654321"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Website URL</Text>
        <TextInput
          style={styles.input}
          value={formData.websiteUrl}
          onChangeText={(text) => updateFormData('websiteUrl', text)}
          placeholder="https://example.com"
          autoCapitalize="none"
          keyboardType="url"
        />
        {errors.websiteUrl && <Text style={styles.errorText}>{errors.websiteUrl}</Text>}
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Open 24 Hours</Text>
        <Switch
          value={formData.is24Hours}
          onValueChange={(value) => updateFormData('is24Hours', value)}
          trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
        />
      </View>

      {!formData.is24Hours && (
        <>
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Opening Time</Text>
              <TextInput
                style={styles.input}
                value={formData.openTime}
                onChangeText={(text) => updateFormData('openTime', text)}
                placeholder="09:00"
              />
            </View>
            <View style={styles.spacer} />
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Closing Time</Text>
              <TextInput
                style={styles.input}
                value={formData.closeTime}
                onChangeText={(text) => updateFormData('closeTime', text)}
                placeholder="18:00"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Operating Days</Text>
            <View style={styles.daysContainer}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayChip,
                    formData.operatingDays.includes(day) && styles.dayChipActive
                  ]}
                  onPress={() => toggleArrayItem('operatingDays', day)}
                >
                  <Text style={[
                    styles.dayChipText,
                    formData.operatingDays.includes(day) && styles.dayChipTextActive
                  ]}>{day.slice(0, 3)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Additional Information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Services Offered</Text>
        <View style={styles.serviceInputRow}>
          <TextInput
            style={[styles.input, styles.serviceInput]}
            placeholder="e.g., Emergency Care"
            value={serviceInput}
            onChangeText={setServiceInput}
          />
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => addService(serviceInput)}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.tagsContainer}>
          {formData.services.map((service, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{service}</Text>
              <TouchableOpacity onPress={() => removeService(index)}>
                <Ionicons name="close-circle" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Languages Spoken</Text>
        <View style={styles.pickerContainer}>
          {['English', 'Hindi', 'Telugu', 'Tamil'].map(lang => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.chipButton,
                formData.languages.includes(lang) && styles.chipButtonActive
              ]}
              onPress={() => toggleArrayItem('languages', lang)}
            >
              <Text style={[
                styles.chipText,
                formData.languages.includes(lang) && styles.chipTextActive
              ]}>{lang}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Wheelchair Accessible</Text>
        <Switch
          value={formData.wheelchairAccessible}
          onValueChange={(value) => updateFormData('wheelchairAccessible', value)}
          trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Parking Available</Text>
        <Switch
          value={formData.parkingAvailable}
          onValueChange={(value) => updateFormData('parkingAvailable', value)}
          trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Additional Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.message}
          onChangeText={(text) => updateFormData('message', text)}
          placeholder="Any special notes or requests"
          multiline
          numberOfLines={4}
          maxLength={500}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose || (() => navigation.goBack())} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resource Registration</Text>
        <View style={styles.placeholder} />
      </View>

      {renderStepIndicator()}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {currentStep > 1 && (
            <TouchableOpacity 
              style={[styles.button, styles.buttonSecondary]} 
              onPress={prevStep}
              disabled={loading}
            >
              <Ionicons name="arrow-back" size={20} color="#2563eb" />
              <Text style={styles.buttonSecondaryText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < 4 ? (
            <TouchableOpacity 
              style={[styles.button, styles.buttonPrimary, currentStep === 1 && styles.buttonFull]} 
              onPress={nextStep}
              disabled={loading}
            >
              <Text style={styles.buttonPrimaryText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.button, styles.buttonPrimary]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonPrimaryText}>Submit</Text>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backButton: {
    padding: 4
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  placeholder: {
    width: 32
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff'
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepCircleActive: {
    backgroundColor: '#2563eb'
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280'
  },
  stepTextActive: {
    color: '#fff'
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4
  },
  stepLineActive: {
    backgroundColor: '#2563eb'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 20
  },
  stepContent: {
    padding: 20
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  chipButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb'
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280'
  },
  chipTextActive: {
    color: '#2563eb',
    fontWeight: '600'
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginLeft: 8
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  flex1: {
    flex: 1
  },
  spacer: {
    width: 12
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  dayChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb'
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280'
  },
  dayChipTextActive: {
    color: '#2563eb',
    fontWeight: '600'
  },
  serviceInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  serviceInput: {
    flex: 1
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2563eb'
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 20
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8
  },
  buttonFull: {
    flex: 1
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  buttonSecondary: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#2563eb'
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb'
  },
  errorText: {
    color: '#ef4444', // A standard red color for errors
    fontSize: 12,
    marginTop: 4,
  }
});