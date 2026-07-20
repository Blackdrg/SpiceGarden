/* eslint-disable */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Easing } from 'react-native';
import Animated, { useSharedValue, withTiming, withSequence } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { safeParse } from '../utils/safe-parse';
import { STRINGS } from '../constants/strings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restaurantService } from '../services/restaurant.service';

interface RestaurantCard {
  id: string;
  name: string;
  description: string;
  rating: number;
  deliveryTime: string;
  distance: string;
  image: string;
  slug: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<{ navigate: (screen: string, params?: { restaurantId?: string; slug?: string }) => void }>();
  const [restaurants, setRestaurants] = useState<RestaurantCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(0);

  useEffect(() => {
    loadRestaurants();
    loadUser();
  }, []);

  const loadRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await restaurantService.getRestaurants();

      const mapped: RestaurantCard[] = data.map((restaurant) => {
        const branch = restaurant.branches?.[0];
        return {
          id: restaurant.id,
          name: restaurant.name,
          description: restaurant.description,
          rating: 0,
          deliveryTime: branch ? `${branch.openingTime} - ${branch.closingTime}` : '30-45 min',
          distance: '',
          image: restaurant.logoUrl || restaurant.bannerUrl || '',
          slug: restaurant.slug || restaurant.id,
        };
      });

      setRestaurants(mapped);
      setLoading(false);

      fadeAnim.value = withTiming(1, { duration: DESIGN_TOKENS.motion.page, easing: Easing.out(Easing.quad) });
      slideAnim.value = withTiming(0, { duration: DESIGN_TOKENS.motion.page, easing: Easing.out(Easing.quad) });
    } catch (err) {
      setError('Failed to load restaurants. Pull to refresh.');
      setLoading(false);
      console.error('Failed to load restaurants:', err);
    }
  }, []);

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

  const renderRestaurant = useCallback(({ item }: { item: RestaurantCard }) => {
    return (
      <Pressable
        style={styles.restaurantCard}
        onPress={() => navigation.navigate('Restaurant' as never, { restaurantId: item.id, slug: item.slug })}
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
              <Text style={styles.ratingText}>★ {item.rating > 0 ? item.rating.toFixed(1) : 'New'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>{item.deliveryTime}</Text>
            </View>
          </View>
        </View>
        <View style={styles.chevronContainer}>
          <Text style={styles.chevron}>›</Text>
        </View>
      </Pressable>
    );
  }, [navigation]);

  const keyExtractor = useCallback((item: RestaurantCard) => item.id, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer} accessible={true} accessibilityLabel="Loading restaurants">
        <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
      </View>
    );
  }

  if (error && restaurants.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadRestaurants}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No restaurants available</Text>
            </View>
          }
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.xl,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  errorText: {
    color: DESIGN_TOKENS.colors.danger,
    fontSize: 16,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textAlign: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  retryButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    borderRadius: DESIGN_TOKENS.radius.button,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.xl,
  },
  emptyText: {
    color: DESIGN_TOKENS.colors.textSecondary,
    fontSize: 16,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
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
