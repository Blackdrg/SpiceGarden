/* eslint-disable */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Easing } from 'react-native';
import Animated, { useSharedValue, withTiming, withSequence } from 'react-native-reanimated';
const AnimatedCompat = Animated as any;
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
  const fadeAnim = useMemo(() => new AnimatedCompat.Value(0), []);
  const slideAnim = useMemo(() => new AnimatedCompat.Value(0), []);

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
          image: '',
        },
        {
          id: 'rest-002',
          name: 'Pizza Hut',
          description: 'Freshly baked pizzas',
          rating: 4.5,
          deliveryTime: '30-35 min',
          distance: '2.1 km',
          image: '',
        },
        {
          id: 'rest-003',
          name: 'Subway',
          description: 'Fresh made sandwiches',
          rating: 4.0,
          deliveryTime: '15-20 min',
          distance: '1.8 km',
          image: '',
        },
      ]);
      setLoading(false);
      
      // Start animations immediately
      AnimatedCompat.parallel([
        AnimatedCompat.timing(fadeAnim, {
          toValue: 1,
          duration: DESIGN_TOKENS.motion.page,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        AnimatedCompat.timing(slideAnim, {
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

  const renderRestaurant = useCallback(({ item }: { item: typeof restaurants[0] }) => {
    return (
      <Pressable
        style={styles.restaurantCard}
        onPress={() => navigation.navigate('Restaurant' as never)}
        accessibilityLabel={item.name}
        accessibilityRole="button"
        android_ripple={{ color: DESIGN_TOKENS.colors.primaryLight }}
      >
        <View style={styles.restaurantImagePlaceholder}>
          <View style={styles.restaurantImageIcon}>
            <Text style={styles.restaurantImageText}>🍽️</Text>
          </View>
        </View>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <Text style={styles.restaurantDescription}>{item.description}</Text>
          <View style={styles.restaurantMeta}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {item.rating}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>{item.deliveryTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>{item.distance}</Text>
            </View>
          </View>
        </View>
        <View style={styles.chevronContainer}>
          <Text style={styles.chevron}>›</Text>
        </View>
      </Pressable>
    );
  }, [navigation]);

  const keyExtractor = useCallback((item: typeof restaurants[0]) => item.id, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer} accessible={true} accessibilityLabel="Loading restaurants">
        <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome{user?.name ? `, ${user.name}` : ', Guest'}
          </Text>
          <Text style={styles.headerSubtext}>Discover restaurants near you</Text>
        </View>
        <FlatList
          data={restaurants}
          keyExtractor={keyExtractor}
          renderItem={renderRestaurant}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </Animated.View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  header: { 
    padding: DESIGN_TOKENS.spacing.md, 
    paddingTop: DESIGN_TOKENS.spacing.lg,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  welcomeText: { 
    fontSize: 24, 
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary, 
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    letterSpacing: -0.01,
  },
  headerSubtext: { 
    fontSize: 14, 
    color: DESIGN_TOKENS.colors.textSecondary, 
    marginTop: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    lineHeight: 20,
  },
  listContent: { 
    paddingBottom: DESIGN_TOKENS.spacing.xl,
  },
  restaurantCard: { 
    backgroundColor: DESIGN_TOKENS.colors.surface, 
    marginHorizontal: DESIGN_TOKENS.spacing.md, 
    marginVertical: DESIGN_TOKENS.spacing.sm, 
    borderRadius: DESIGN_TOKENS.radius.card, 
    padding: DESIGN_TOKENS.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...DESIGN_TOKENS.shadows.small,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
  },
  restaurantImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: DESIGN_TOKENS.radius.md,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DESIGN_TOKENS.spacing.md,
  },
  restaurantImageIcon: {
    width: 40,
    height: 40,
    borderRadius: DESIGN_TOKENS.radius.sm,
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantImageText: {
    fontSize: 20,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: { 
    fontSize: 16, 
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary, 
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginBottom: 2,
  },
  restaurantDescription: { 
    fontSize: 13, 
    color: DESIGN_TOKENS.colors.textSecondary, 
    marginTop: 2,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    lineHeight: 18,
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  restaurantMeta: { 
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  ratingBadge: {
    backgroundColor: DESIGN_TOKENS.colors.warningLight,
    paddingHorizontal: DESIGN_TOKENS.spacing.xs,
    paddingVertical: 2,
    borderRadius: DESIGN_TOKENS.radius.sm,
  },
  ratingText: { 
    fontSize: 13, 
    color: DESIGN_TOKENS.colors.warningDark, 
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: { 
    fontSize: 12, 
    color: DESIGN_TOKENS.colors.textSecondary, 
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  chevronContainer: {
    marginLeft: DESIGN_TOKENS.spacing.sm,
  },
  chevron: {
    fontSize: 20,
    color: DESIGN_TOKENS.colors.textTertiary,
    fontWeight: '300',
  },
});

