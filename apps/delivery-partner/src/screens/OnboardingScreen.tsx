import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Animated, Easing, Alert } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface OnboardingData {
  fullName: string;
  phone: string;
  email: string;
  vehicleType: string;
  licenseNumber: string;
  vehicleRegistration: string;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: '',
    phone: '',
    email: '',
    vehicleType: '',
    licenseNumber: '',
    vehicleRegistration: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const slides = [
    {
      title: 'Personal Information',
      subtitle: 'Tell us about yourself',
      fields: ['fullName', 'phone', 'email'] as const,
    },
    {
      title: 'Vehicle Details',
      subtitle: 'Register your delivery vehicle',
      fields: ['vehicleType', 'licenseNumber', 'vehicleRegistration'] as const,
    },
    {
      title: 'Verification',
      subtitle: 'Upload documents for verification',
      type: 'documents',
    },
  ];

  const validateField = useCallback((field: string, value: string) => {
    switch (field) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Invalid email format';
        }
        break;
      case 'phone':
        if (value && !/^\d{10}$/.test(value)) {
          return 'Enter a valid 10-digit phone number';
        }
        break;
      case 'licenseNumber':
        if (!value) return 'License number required';
        break;
    }
    return '';
  }, []);

  const handleNext = async () => {
    if (step < slides.length - 1) {
      const currentFields = slides[step].fields;
      const newErrors: Record<string, string> = {};
      
      if (currentFields) {
        currentFields.forEach(field => {
          const error = validateField(field, formData[field]);
          if (error) newErrors[field] = error;
        });
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setStep(step + 1);
      animateTransition();
    } else {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      animateTransition();
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem('driver_onboarding_completed', 'true');
      await AsyncStorage.setItem('driver_profile', JSON.stringify(formData));
      onComplete();
    } catch {
      Alert.alert('Error', 'Failed to save onboarding data');
    } finally {
      setLoading(false);
    }
  };

  const animateTransition = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: step > 2 ? 20 : -20,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const renderField = (field: string) => {
    const fieldLabels: Record<string, string> = {
      fullName: 'Full Name',
      phone: 'Phone Number',
      email: 'Email Address',
      vehicleType: 'Vehicle Type',
      licenseNumber: 'License Number',
      vehicleRegistration: 'Registration Number',
    };

    const fieldPlaceholders: Record<string, string> = {
      fullName: 'Enter your full name',
      phone: 'Enter 10-digit phone number',
      email: 'Enter your email',
      vehicleType: 'Bike, Scooter, Car, etc.',
      licenseNumber: 'DL-XXXX-XXXX-XX',
      vehicleRegistration: 'PB-01-AB-1234',
    };

    return (
      <View key={field} style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{fieldLabels[field]}</Text>
        <TextInput
          placeholder={fieldPlaceholders[field]}
          value={formData[field as keyof OnboardingData]}
          onChangeText={(text: string) => {
            setFormData({ ...formData, [field]: text });
            if (errors[field]) {
              setErrors({ ...errors, [field]: '' });
            }
          }}
          style={[styles.input, errors[field] && styles.inputError]}
        />
        {errors[field] && <Text style={styles.fieldError}>{errors[field]}</Text>}
      </View>
    );
  };

  const renderDocumentsStep = () => (
    <View style={styles.documentsStep}>
      <View style={styles.documentCard}>
        <Text style={styles.documentIcon}>📄</Text>
        <Text style={styles.documentTitle}>Driver License</Text>
        <Text style={styles.documentHint}>Front & back side</Text>
        <Pressable style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Upload</Text>
        </Pressable>
      </View>

      <View style={styles.documentCard}>
        <Text style={styles.documentIcon}>🚗</Text>
        <Text style={styles.documentTitle}>Vehicle Registration</Text>
        <Text style={styles.documentHint}>RC Document</Text>
        <Pressable style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Upload</Text>
        </Pressable>
      </View>

      <View style={styles.documentCard}>
        <Text style={styles.documentIcon}>🛡️</Text>
        <Text style={styles.documentTitle}>Insurance</Text>
        <Text style={styles.documentHint}>Valid insurance document</Text>
        <Pressable style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Upload</Text>
        </Pressable>
      </View>
    </View>
  );

  const currentSlide = slides[step];

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {slides.map((slide, index) => (
          <View
            key={index} /* react-doctor: no-array-index-as-key */
            style={[
              styles.progressDot,
              index === step && styles.progressDotActive,
              index < step && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }] 
          }
        ]}
      >
        <Text style={styles.title}>{currentSlide.title}</Text>
        <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>

        {currentSlide.type === 'documents' ? (
          renderDocumentsStep()
        ) : (
          currentSlide.fields?.map(renderField)
        )}
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.navigationRow}>
          {step > 0 && (
<Pressable
               onPress={handleBack}
               style={styles.navButton}
             >
               <Text style={styles.navButtonText}>← Back</Text>
             </Pressable>
          )}
          
<Pressable
             onPress={handleNext}
             style={[styles.navButton, styles.nextButton]}
           >
             <Text style={[styles.navButtonText, styles.nextButtonText]}>
               {loading 
                 ? 'Saving...' 
                 : step === slides.length - 1 
                   ? 'Complete' 
                   : 'Next →'}
             </Text>
           </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(156, 163, 175, 0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: DESIGN_TOKENS.colors.success,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  subtitle: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  inputGroup: {
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    borderRadius: DESIGN_TOKENS.radius.input,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    fontSize: 16,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  inputError: {
    borderColor: DESIGN_TOKENS.colors.danger,
  },
  fieldError: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.danger,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  documentsStep: {
    gap: DESIGN_TOKENS.spacing.md,
  },
  documentCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.lg,
    alignItems: 'center',
    elevation: 2,
  },
  documentIcon: {
    fontSize: 40,
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginTop: DESIGN_TOKENS.spacing.sm,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  documentHint: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  uploadButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: DESIGN_TOKENS.radius.button,
    marginTop: DESIGN_TOKENS.spacing.md,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  footer: {
    padding: 20,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: DESIGN_TOKENS.radius.button,
  },
  nextButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  nextButtonText: {
    color: 'white',
  },
});

export default OnboardingScreen;