import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Animated, Easing, ActivityIndicator, Alert } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   
   const fadeAnim = useRef(new Animated.Value(0)).current;
   const shakeAnim = useRef(new Animated.Value(0)).current;

   const API_URL = 'http://localhost:3001';

   useEffect(() => {
     Animated.timing(fadeAnim, {
       toValue: 1,
       duration: DESIGN_TOKENS.motion.page,
       easing: Easing.out(Easing.quad),
       useNativeDriver: true,
     }).start();
   }, [fadeAnim]);

   const shakeAnimation = useCallback(() => {
     Animated.sequence([
       Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
       Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
       Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
       Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
     ]).start();
   }, [shakeAnim]);

   const handleLogin = useCallback(async (): Promise<void> => {
     if (!email || !password) {
       shakeAnimation();
       return;
     }

     setLoading(true);
     try {
       const response = await fetch(`${API_URL}/api/auth/driver-login`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email, password }),
       });

       const data = await response.json();

       if (response.ok && data.access_token) {
         await AsyncStorage.setItem('driver_token', data.access_token);
         onLoginSuccess();
       } else {
         Alert.alert('Login Failed', data.message || 'Please check your credentials');
         shakeAnimation();
       }
} catch {
        Alert.alert('Connection Error', 'Please check your network connection');
        shakeAnimation();
      } finally {
       setLoading(false);
     }
   }, [email, password, onLoginSuccess, shakeAnimation]);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Driver Login</Text>
          <Text style={styles.headerSubtitle}>Access your delivery dashboard</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
<TextInput
               placeholder="Enter your email"
               value={email}
               onChangeText={setEmail}
               autoCapitalize="none"
               keyboardType="email-address"
               style={styles.input}
               textContentType="emailAddress"
             />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <Pressable
            onPress={handleLogin}
            style={[styles.loginButton, loading && styles.loginButtonLoading]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
    justifyContent: 'center',
    padding: DESIGN_TOKENS.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  headerSubtitle: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  formContainer: {
    width: '100%',
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
  loginButton: {
    height: 50,
    backgroundColor: DESIGN_TOKENS.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DESIGN_TOKENS.radius.button,
    marginTop: DESIGN_TOKENS.spacing.lg,
  },
  loginButtonLoading: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default LoginScreen;