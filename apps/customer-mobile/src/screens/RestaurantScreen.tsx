import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Easing } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { restaurantService, MenuItem } from '../services/restaurant.service';
import { getCartSafe, saveCartSafe } from '../utils/secure-storage';

type RestaurantParams = RootStackParamList['Restaurant'];

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

const RestaurantScreen = () => {
  const route = useRoute();
  const { restaurantId, slug } = route.params as RestaurantParams;
  const [restaurant, setRestaurant] = useState<{ id: string; name: string; description: string; address: string; rating: number; deliveryTime: string } | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingItem, setAddingItem] = useState<string | null>(null);

  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const restaurantData = await restaurantService.getRestaurantBySlug(slug || restaurantId);
        if (!restaurantData) {
          setError('Restaurant not found');
          setLoading(false);
          return;
        }

        const branch = restaurantData.branches?.[0];
        setRestaurant({
          id: restaurantData.id,
          name: restaurantData.name,
          description: restaurantData.description,
          address: branch?.address || '',
          rating: 0,
          deliveryTime: branch ? `${branch.openingTime} - ${branch.closingTime}` : '30-45 min',
        });

        const items = await restaurantService.getMenuItems(restaurantId);
        setMenuItems(items);
        setLoading(false);

        fadeAnim.value = withTiming(1, { duration: DESIGN_TOKENS.motion.standard, easing: Easing.out(Easing.quad) });
      } catch (err) {
        setError('Failed to load menu');
        setLoading(false);
        console.error('Failed to load restaurant data:', err);
      }
    };
    loadData();
  }, [restaurantId, slug]);

  const addToCart = async (item: MenuItem) => {
    try {
      const currentCart = (await getCartSafe()) as CartItem[];
      const existing = currentCart.find((ci) => ci.id === item.id);
      const nextCart = existing
        ? currentCart.map((ci) =>
            ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
          )
        : [
            ...currentCart,
            {
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              quantity: 1,
              image: '',
              restaurantId,
              restaurantName: restaurant?.name || '',
            },
          ];
      await saveCartSafe(nextCart);
      setAddingItem(item.id);
      setTimeout(() => setAddingItem(null), 500);
    } catch {
      setAddingItem(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={DESIGN_TOKENS.colors.danger} />
        </View>
        <Text style={styles.errorText}>{error || 'Restaurant not found'}</Text>
        <Pressable style={styles.retryButton} onPress={() => setLoading(true)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, backgroundColor: DESIGN_TOKENS.colors.background }}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>{restaurant.name}</Text>
          <View style={styles.headerMetaRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={DESIGN_TOKENS.colors.warning} />
              <Text style={styles.ratingText}>{restaurant.rating > 0 ? restaurant.rating.toFixed(1) : 'New'}</Text>
            </View>
            <Text style={styles.dividerDot}>•</Text>
            <Text style={styles.subtitle}>{restaurant.deliveryTime}</Text>
            <Text style={styles.dividerDot}>•</Text>
            <Text style={styles.subtitle}>{restaurant.address}</Text>
          </View>
        </View>
      </View>
      <Animated.View style={[styles.menuContainer, { opacity: fadeAnim }]}>
        {menuItems.map(item => (
          <Pressable
             key={item.id}
            style={styles.menuItem}
            onPress={() => addToCart(item)}
          >
            <View style={styles.itemIconContainer}>
              <Ionicons name="fast-food-outline" size={28} color={DESIGN_TOKENS.colors.primary} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
            <View style={styles.addButtonContainer}>
              {addingItem === item.id ? (
                <View style={styles.addedBadge}>
                  <Ionicons name="checkmark" size={16} color={DESIGN_TOKENS.colors.success} />
                  <Text style={styles.addedText}>Added</Text>
                </View>
              ) : (
                <Pressable style={styles.addButton}>
                  <Ionicons name="add" size={20} color={DESIGN_TOKENS.colors.surface} />
                </Pressable>
              )}
            </View>
          </Pressable>
        ))}
        {menuItems.length === 0 && (
          <View style={styles.emptyMenu}>
            <Text style={styles.emptyMenuText}>No menu items available</Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

export default RestaurantScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  loadingText: {
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: DESIGN_TOKENS.spacing.md,
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.xl,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: DESIGN_TOKENS.radius.full,
    backgroundColor: DESIGN_TOKENS.colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  errorText: {
    color: DESIGN_TOKENS.colors.danger,
    fontSize: 16,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginBottom: DESIGN_TOKENS.spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    borderRadius: DESIGN_TOKENS.radius.button,
    ...DESIGN_TOKENS.shadows.small,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  header: {
    padding: DESIGN_TOKENS.spacing.md,
    paddingTop: DESIGN_TOKENS.spacing.lg,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  headerTitleContainer: {
    gap: DESIGN_TOKENS.spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: DESIGN_TOKENS.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  dividerDot: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textTertiary,
  },
  subtitle: {
    color: DESIGN_TOKENS.colors.textSecondary,
    fontSize: 13,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  menuContainer: {
    padding: DESIGN_TOKENS.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.sm,
    borderRadius: DESIGN_TOKENS.radius.card,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: DESIGN_TOKENS.radius.md,
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DESIGN_TOKENS.spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  itemDescription: {
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 2,
    fontSize: 13,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    lineHeight: 18,
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  itemPrice: {
    color: DESIGN_TOKENS.colors.primary,
    marginTop: 2,
    fontWeight: '700',
    fontSize: 15,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  addButtonContainer: {
    justifyContent: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: DESIGN_TOKENS.radius.full,
    backgroundColor: DESIGN_TOKENS.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...DESIGN_TOKENS.shadows.small,
  },
  addedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
    paddingHorizontal: DESIGN_TOKENS.spacing.sm,
    paddingVertical: DESIGN_TOKENS.spacing.xs,
    borderRadius: DESIGN_TOKENS.radius.full,
    backgroundColor: DESIGN_TOKENS.colors.successLight,
  },
  addedText: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.successDark,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  emptyMenu: {
    padding: DESIGN_TOKENS.spacing.xl,
    alignItems: 'center',
  },
  emptyMenuText: {
    color: DESIGN_TOKENS.colors.textSecondary,
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});
