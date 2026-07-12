import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Easing } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
const AnimatedCompat = Animated as any;
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/core';
import * as Haptics from 'expo-haptics';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../constants/api';

interface Addon {
  id: string;
  name: string;
  price: number;
}

interface MenuItemDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
  addons: Addon[];
}

const MenuItemCustomizationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { itemId } = route.params as { itemId: string };
  
  const [item, setItem] = useState<MenuItemDetail | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const selectedAddonSet = useMemo(() => new Set(selectedAddons), [selectedAddons]);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(true);
  
  const fadeAnim = useMemo(() => new AnimatedCompat.Value(0), []);

  const fetchItemDetails = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/menus/items/${itemId}`);
      if (response.ok) {
        setItem(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch item details:', error);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchItemDetails();
    AnimatedCompat.timing(fadeAnim, {
      toValue: 1,
      duration: DESIGN_TOKENS.motion.page,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fetchItemDetails, fadeAnim]);

  const toggleAddon = useCallback((addonId: string) => {
    Haptics.selectionAsync();
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId) 
        : [...prev, addonId]
    );
  }, []);

  const calculateTotalPrice = useCallback(() => {
    if (!item) return 0;
    const addonPrice = item.addons
      .filter(a => selectedAddonSet.has(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    return (item.price + addonPrice) * quantity;
  }, [item, selectedAddonSet, quantity]);

  const handleAddToCart = useCallback(() => {
    if (!item) return;

    const cartItem = {
      id: item.id,
      name: item.name,
      quantity,
      price: item.price,
      totalPrice: calculateTotalPrice(),
      instructions: instructions.trim() || undefined,
      addons: item.addons.filter(a => selectedAddonSet.has(a.id)),
    };

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('Cart' as never);
  }, [item, quantity, selectedAddonSet, instructions, calculateTotalPrice, navigation]);

  if (loading || !item) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={DESIGN_TOKENS.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerText}>Customize Item</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemPrice}>₹{calculateTotalPrice()}</Text>
          </View>

          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <Pressable 
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.quantityButton}
                accessibilityLabel="Decrease quantity"
              >
                <Ionicons name="remove" size={24} color={DESIGN_TOKENS.colors.primary} />
              </Pressable>
              <Text style={styles.quantityText}>{quantity}</Text>
              <Pressable 
                onPress={() => setQuantity((prev) => prev + 1)}
                style={styles.quantityButton}
                accessibilityLabel="Increase quantity"
              >
                <Ionicons name="add" size={24} color={DESIGN_TOKENS.colors.primary} />
              </Pressable>
            </View>
          </View>

          {item.addons.length > 0 && (
            <View style={styles.addonsSection}>
              <Text style={styles.sectionTitle}>Add-ons</Text>
              {item.addons.map((addon) => (
                <Pressable
                  key={addon.id}
                  onPress={() => toggleAddon(addon.id)}
                  style={[styles.addonItem, selectedAddonSet.has(addon.id) && styles.addonItemSelected]}
                  accessibilityLabel={`Add ${addon.name}`}
                >
                  <View style={styles.addonInfo}>
                    <Text style={styles.addonName}>{addon.name}</Text>
                    <Text style={styles.addonPrice}>+₹{addon.price}</Text>
                  </View>
                  <View style={[styles.checkbox, selectedAddonSet.has(addon.id) && styles.checkboxSelected]}>
                    {selectedAddonSet.has(addon.id) && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.instructionsSection}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <TextInput
              placeholder="Add special instructions (optional)"
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={3}
              style={styles.instructionsInput}
              accessibilityLabel="Special instructions input"
            />
          </View>
        </ScrollView>

        <Pressable 
          onPress={handleAddToCart}
          style={styles.addToCartButton}
          accessibilityLabel="Add to cart"
        >
          <Text style={styles.addToCartButtonText}>Add to Cart - ₹{calculateTotalPrice()}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

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
  loadingText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    paddingTop: DESIGN_TOKENS.spacing.lg,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: DESIGN_TOKENS.radius.md,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.xs,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: DESIGN_TOKENS.spacing.md,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  content: {
    flex: 1,
    padding: DESIGN_TOKENS.spacing.md,
  },
  itemInfo: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    marginBottom: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  itemDescription: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: DESIGN_TOKENS.colors.primary,
    marginTop: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: DESIGN_TOKENS.spacing.sm,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quantitySection: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    marginBottom: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DESIGN_TOKENS.spacing.lg,
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    borderRadius: DESIGN_TOKENS.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...DESIGN_TOKENS.shadows.small,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    minWidth: 40,
    textAlign: 'center',
  },
  addonsSection: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    marginBottom: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  addonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  addonItemSelected: {
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
  },
  addonInfo: {
    flex: 1,
  },
  addonName: {
    fontSize: 15,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  addonPrice: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 2,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: DESIGN_TOKENS.radius.sm,
    borderWidth: 2,
    borderColor: DESIGN_TOKENS.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    borderColor: DESIGN_TOKENS.colors.primary,
  },
  instructionsSection: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    marginBottom: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    borderRadius: DESIGN_TOKENS.radius.lg,
    padding: DESIGN_TOKENS.spacing.sm,
    fontSize: 15,
    marginTop: DESIGN_TOKENS.spacing.sm,
    minHeight: 80,
    textAlignVertical: 'top',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    backgroundColor: DESIGN_TOKENS.colors.background,
    color: DESIGN_TOKENS.colors.textPrimary,
  },
  addToCartButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    padding: DESIGN_TOKENS.spacing.md,
    margin: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
    ...DESIGN_TOKENS.shadows.medium,
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default MenuItemCustomizationScreen;
