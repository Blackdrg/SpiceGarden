import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Easing, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, withTiming, withSequence } from 'react-native-reanimated';
const AnimatedCompat = Animated as any;
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../constants/api';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

   const navigation = useNavigation();
  const fadeAnim = useMemo(() => new AnimatedCompat.Value(0), []);
  const shakeAnim = useMemo(() => new AnimatedCompat.Value(0), []);

  useEffect(() => {
    AnimatedCompat.timing(fadeAnim, {
      toValue: 1,
      duration: DESIGN_TOKENS.motion.page,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('Email is required');
    } else if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Password is required');
    } else if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async () => {
    setError('');

    validateEmail(email);
    validatePassword(password);

    if (!isLogin && !name) {
      setError('Name is required');
      return;
    }

    if (!isLogin && !phone) {
      setError('Phone number is required');
      return;
    }

    if (emailError || passwordError) return;

    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          ...(!isLogin && { name, phone }),
          deviceName: 'mobile',
          deviceType: 'mobile',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('sg_token', data.access_token);
        await AsyncStorage.setItem('sg_user', JSON.stringify({
          email,
          name: isLogin ? '' : name,
          phone: isLogin ? '' : phone,
        }));
        navigation.replace('Main');
      } else {
        setError(data.message || (isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.'));
        shakeAnimation();
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      shakeAnimation();
    } finally {
      setLoading(false);
    }
  };

  const shakeAnimation = () => {
    AnimatedCompat.sequence([
      AnimatedCompat.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      AnimatedCompat.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      AnimatedCompat.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      AnimatedCompat.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="restaurant" size={32} color={DESIGN_TOKENS.colors.primary} />
            </View>
          </View>
          <Text style={styles.headerText}>SpiceGarden</Text>
          <Text style={styles.headerSubtext}>Order food from your favourite restaurants</Text>
        </View>

        <View style={styles.formContainer}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <View style={styles.iconInputRow}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="person-outline" size={18} color={DESIGN_TOKENS.colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  accessibilityLabel="Full name"
                  accessibilityHint="Enter your full name as it appears on your ID"
                />
              </View>
            </View>
          )}

          {!isLogin && (
            <View style={styles.inputGroup}>
              <View style={styles.iconInputRow}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="call-outline" size={18} color={DESIGN_TOKENS.colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  accessibilityLabel="Phone number"
                  accessibilityHint="Enter your mobile number"
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <View style={[styles.iconInputRow, emailError ? styles.iconInputRowError : {}]}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="mail-outline" size={18} color={emailError ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.textSecondary} />
              </View>
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) validateEmail(text);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                accessibilityLabel="Email address"
                accessibilityHint="Enter your email for account access"
              />
            </View>
            {emailError && <Text style={styles.fieldError}>{emailError}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <View style={[styles.iconInputRow, passwordError ? styles.iconInputRowError : {}]}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="lock-closed-outline" size={18} color={passwordError ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.textSecondary} />
              </View>
              <TextInput
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) validatePassword(text);
                }}
                secureTextEntry
                style={styles.input}
                accessibilityLabel="Password"
                accessibilityHint={isLogin ? "Enter your password" : "Create a secure password"}
              />
            </View>
            {passwordError && <Text style={styles.fieldError}>{passwordError}</Text>}
          </View>

          {error && (
            <View style={styles.errorContainer} accessibilityLiveRegion="polite">
              <Ionicons name="alert-circle-outline" size={18} color={DESIGN_TOKENS.colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            onPress={handleSubmit}
            style={[styles.button, loading ? styles.buttonLoading : null]}
            disabled={loading}
            accessibilityLabel={isLogin ? "Sign in" : "Create account"}
            accessibilityRole="button"
            accessibilityState={{ disabled: loading }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </Pressable>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          onPress={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          style={styles.toggleButton}
          accessibilityLabel={isLogin ? "Create new account" : "Sign in to existing account"}
          accessibilityRole="button"
        >
          <Text style={styles.toggleButtonText}>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.xl,
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
  },
  logoContainer: {
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: DESIGN_TOKENS.radius.lg,
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '800',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    letterSpacing: -0.5,
  },
  headerSubtext: {
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: DESIGN_TOKENS.spacing.xs,
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderTopWidth: 1,
    borderTopColor: DESIGN_TOKENS.colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    paddingVertical: DESIGN_TOKENS.spacing.lg,
  },
  inputGroup: {
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  iconInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    borderRadius: DESIGN_TOKENS.radius.lg,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    backgroundColor: DESIGN_TOKENS.colors.background,
    minHeight: 50,
  },
  iconInputRowError: {
    borderColor: DESIGN_TOKENS.colors.danger,
    backgroundColor: DESIGN_TOKENS.colors.dangerLight + '20',
  },
  inputIconContainer: {
    width: 32,
    height: 32,
    borderRadius: DESIGN_TOKENS.radius.sm,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  fieldError: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.danger,
    marginTop: DESIGN_TOKENS.spacing.xs,
    marginLeft: DESIGN_TOKENS.spacing.sm,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  errorContainer: {
    marginBottom: DESIGN_TOKENS.spacing.sm,
    padding: DESIGN_TOKENS.spacing.sm,
    backgroundColor: DESIGN_TOKENS.colors.dangerLight,
    borderRadius: DESIGN_TOKENS.radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
  },
  errorText: {
    color: DESIGN_TOKENS.colors.danger,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    flex: 1,
  },
  button: {
    height: 50,
    backgroundColor: DESIGN_TOKENS.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DESIGN_TOKENS.radius.button,
    marginTop: DESIGN_TOKENS.spacing.lg,
    ...DESIGN_TOKENS.shadows.small,
  },
  buttonLoading: {
    opacity: 0.8,
  },
  buttonText: {
    color: DESIGN_TOKENS.colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: DESIGN_TOKENS.spacing.lg,
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: DESIGN_TOKENS.colors.border,
  },
  dividerText: {
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: DESIGN_TOKENS.spacing.sm,
  },
  toggleButtonText: {
    color: DESIGN_TOKENS.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default AuthScreen;
