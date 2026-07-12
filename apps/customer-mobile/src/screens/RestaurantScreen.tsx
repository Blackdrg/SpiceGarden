import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Easing } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
const AnimatedCompat = Animated as any;
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';

interface RestaurantInfo {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  address: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

const RestaurantScreen = () => {
   const [restaurantId, setRestaurantId] = useState<string | null>(null);
   const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
   const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [addingItem, setAddingItem] = useState<string | null>(null);
   
   const fadeAnim = useMemo(() => new AnimatedCompat.Value(0), []);

   useEffect(() => {
     const loadData = async () => {
       try {
         // Removed fake API delay - directly set data
         
         const restaurants: Record<string, RestaurantInfo> = {
           'rest-001': { id: 'rest-001', name: 'Burger King', rating: 4.2, deliveryTime: '25-30 min', address: 'Phase 5, Mohali' },
           'rest-002': { id: 'rest-002', name: 'Pizza Hut', rating: 4.5, deliveryTime: '30-35 min', address: 'Phase 7, Mohali' },
           'rest-003': { id: 'rest-003', name: 'Subway', rating: 4.0, deliveryTime: '15-20 min', address: 'Sector 17, Chandigarh' },
         };
         
         setRestaurant(restaurants[restaurantId!] || null);
         
         let items: MenuItem[] = [];
         if (restaurantId === 'rest-001') {
           items = [
              { id: 'item-001', name: 'Whopper', description: 'Flame-grilled beef patty with fresh lettude', price: 149, category: 'burgers', image: '' },
              { id: 'item-002', name: 'Double Whopper', description: 'Two flame-grilled beef patties', price: 199, category: 'burgers', image: '' },
           ];
         } else if (restaurantId === 'rest-002') {
           items = [
              { id: 'item-007', name: 'Margherita Pizza', description: 'Fresh mozzarella & tomatoes', price: 299, category: 'pizza', image: '' },
           ];
         } else {
           items = [
              { id: 'item-013', name: 'Chicken Teriyaki', description: 'Grilled chicken with teriyaki sauce', price: 249, category: 'sandwiches', image: '' },
           ];
         }
         
         setMenuItems(items);
         setLoading(false);
         
          AnimatedCompat.timing(fadeAnim, {
           toValue: 1,
           duration: DESIGN_TOKENS.motion.standard,
           easing: Easing.out(Easing.quad),
           useNativeDriver: true,
         }).start();
       } catch (error) {
         setError('Failed to load menu');
         setLoading(false);
       }
     };
     loadData();
   }, [restaurantId, fadeAnim]);

    const addToCart = (itemId: string) => {
      setAddingItem(itemId);
      setTimeout(() => setAddingItem(null), 500);
    };

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
          <Text style={styles.loadingText}>Loading menu...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={40} color={DESIGN_TOKENS.colors.danger} />
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => setLoading(true)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <Animated.View style={{ flex: 1, backgroundColor: DESIGN_TOKENS.colors.background }}>
        {restaurant && (
          <>
            <View style={styles.header}>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.title}>{restaurant.name}</Text>
                <View style={styles.headerMetaRow}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color={DESIGN_TOKENS.colors.warning} />
                    <Text style={styles.ratingText}>{restaurant.rating}</Text>
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
                  onPress={() => addToCart(item.id)}
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
            </Animated.View>
          </>
        )}
      </Animated.View>
    );
  };

export default RestaurantScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DESIGN_TOKENS.colors.background },
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
});
