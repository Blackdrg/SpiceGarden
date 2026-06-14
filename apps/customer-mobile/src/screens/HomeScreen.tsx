/* eslint-disable */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { safeParse } from '../utils/safe-parse';
import { STRINGS } from '../constants/strings';
import AsyncStorage from '@react-native-async-storage/async-storage';


const HomeScreen = () => {
  const navigation = useNavigation<{ navigate: (screen: string) => void }>();
  const [restaurants, setRestaurants] = useState<{ id: string; name: string; description: string; rating: number; deliveryTime: string; distance: string; image: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRestaurants();
    loadUser();
  }, []);

  const loadRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Directly set restaurants data (removed fake API delay)
      setRestaurants([
        {
          id: 'rest-001',
          name: 'Burger King',
          description: 'Flame-grilled burgers & fries',
          rating: 4.2,
          deliveryTime: '25-30 min',
          distance: '3.2 km',
          image: 'https://example.com/burger-king.jpg',
        },
        {
          id: 'rest-002',
          name: 'Pizza Hut',
          description: 'Freshly baked pizzas',
          rating: 4.5,
          deliveryTime: '30-35 min',
          distance: '2.1 km',
          image: 'https://example.com/pizza-hut.jpg',
        },
        {
          id: 'rest-003',
          name: 'Subway',
          description: 'Fresh made sandwiches',
          rating: 4.0,
          deliveryTime: '15-20 min',
          distance: '1.8 km',
          image: 'https://example.com/subway.jpg',
        },
      ]);
      setLoading(false);
      
      // Start animations immediately
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: DESIGN_TOKENS.motion.page,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: DESIGN_TOKENS.motion.page,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      setError('Failed to load restaurants. Pull to refresh.');
      setLoading(false);
      console.error('Failed to load restaurants:', error);
    }
  }, [fadeAnim, slideAnim]);

  const loadUser = useCallback(async () => {
    try {
      const userJson = await AsyncStorage.getItem('sg_user');
      if (userJson) {
        const parsed = safeParse(userJson);
        if (parsed) {
          setUser(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadRestaurants();
    } finally {
      setRefreshing(false);
    }
  }, [loadRestaurants]);

  // Rest of the component remains the same...
};
