import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Easing } from 'react-native';

// Navigation persistence hook
export const useNavigationPersistence = (key: string, value: string) => {
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
    }
  }, [value]);

  return prevValueRef.current;
};

// Deep linking configuration
export const linking = {
  prefixes: ['spicegarden://', 'https://spicegarden.app'],
  config: {
    screens: {
      Auth: 'auth',
      Home: {
        path: 'home',
        parse: { restaurant: (id: string) => `rest-${id}` },
      },
      Cart: 'cart',
      Tracking: {
        path: 'tracking/:orderId',
        parse: { orderId: (id: string) => id },
      },
      OrderDetails: {
        path: 'order/:orderId',
        parse: { orderId: (id: string) => id },
      },
      Profile: 'profile',
    },
  },
};

// Accessibility focus manager
export const useAccessibilityFocus = () => {
  const focusAnim = useRef(new Animated.Value(0)).current;

  const focusElement = (callback?: () => void) => {
    Animated.sequence([
      Animated.timing(focusAnim, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(focusAnim, { toValue: 0, duration: 150, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start();
    callback?.();
  };

  return { focusAnim, focusElement };
};

// Performance timing hooks
export const usePerformanceTimer = (name: string) => {
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
    return () => {
      if (startTimeRef.current) {
        const duration = Date.now() - startTimeRef.current;
        console.log(`[Performance] ${name} took ${duration}ms`);
      }
    };
  }, [name]);
};

// Analytics tracking for React Native
export const trackEvent = (event: string, properties?: Record<string, unknown>) => {
  console.log(`[Analytics] ${event}`, properties);
};