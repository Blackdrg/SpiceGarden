/* eslint-disable */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Animated, Easing } from 'react-native';
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
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    loadRestaurants();
    loadUser();
  }, []);

  const loadRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      setRestaurants([
        {
          id: 'rest-001',
          name: 'SpiceGarden Signature Kitchen',
          description: 'Awadhi & Mughlai • Handi Biryani • Kebabs',
          rating: 4.9,
          deliveryTime: '20-25 min',
          distance: '1.2 km',
          image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'rest-002',
          name: 'Punjab Grill & Curry House',
          description: 'North Indian • Butter Chicken • Dal Makhani',
          rating: 4.8,
          deliveryTime: '25-30 min',
          distance: '2.4 km',
          image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'rest-003',
          name: 'Artisan Woodfired Pizzeria',
          description: 'Italian Sourdough Pizzas • Burrata & Pasta',
          rating: 4.8,
          deliveryTime: '20-25 min',
          distance: '1.8 km',
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
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

  const renderRestaurant = useCallback(({ item }: { item: typeof restaurants[0] }) => {
    return (
      <Pressable
        style={styles.restaurantCard}
        onPress={() => navigation.navigate('Restaurant' as never)}
        accessibilityLabel={item.name}
        accessibilityRole="button"
      >
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <Text style={styles.restaurantDescription}>{item.description}</Text>
          <View style={styles.restaurantMeta}>
            <Text style={styles.ratingText}>★ {item.rating}</Text>
            <Text style={styles.metaText}>{item.deliveryTime}</Text>
            <Text style={styles.metaText}>{item.distance}</Text>
          </View>
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
  container: { flex: 1, backgroundColor: DESIGN_TOKENS.colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: DESIGN_TOKENS.spacing.md, backgroundColor: DESIGN_TOKENS.colors.surface },
  welcomeText: { fontSize: 20, fontWeight: '600', color: DESIGN_TOKENS.colors.textPrimary, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  headerSubtext: { fontSize: 14, color: DESIGN_TOKENS.colors.textSecondary, marginTop: 4, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  listContent: { paddingBottom: DESIGN_TOKENS.spacing.md },
  restaurantCard: { backgroundColor: DESIGN_TOKENS.colors.surface, marginHorizontal: DESIGN_TOKENS.spacing.md, marginVertical: DESIGN_TOKENS.spacing.xs, borderRadius: DESIGN_TOKENS.radius.card, padding: DESIGN_TOKENS.spacing.md },
  restaurantInfo: {},
  restaurantName: { fontSize: 18, fontWeight: '600', color: DESIGN_TOKENS.colors.textPrimary, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  restaurantDescription: { fontSize: 14, color: DESIGN_TOKENS.colors.textSecondary, marginTop: 4, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  restaurantMeta: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  ratingText: { fontSize: 14, color: DESIGN_TOKENS.colors.warning, marginRight: DESIGN_TOKENS.spacing.sm, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  metaText: { fontSize: 12, color: DESIGN_TOKENS.colors.textSecondary, marginRight: DESIGN_TOKENS.spacing.sm, fontFamily: DESIGN_TOKENS.typography.fontFamily },
});

