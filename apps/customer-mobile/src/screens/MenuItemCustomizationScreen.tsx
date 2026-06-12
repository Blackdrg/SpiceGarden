import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, ScrollView, TextInput, Alert } from 'react-native';
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
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    Animated.timing(fadeAnim, {
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
      .filter(a => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    return (item.price + addonPrice) * quantity;
  }, [item, selectedAddons, quantity]);

  const handleAddToCart = useCallback(() => {
    if (!item) return;

    const cartItem = {
      id: item.id,
      name: item.name,
      quantity,
      price: item.price,
      totalPrice: calculateTotalPrice(),
      instructions: instructions.trim() || undefined,
      addons: item.addons.filter(a => selectedAddons.includes(a.id)),
    };

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('Cart' as never);
  }, [item, quantity, selectedAddons, instructions, calculateTotalPrice, navigation]);

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={DESIGN_TOKENS.colors.textPrimary} />
          </TouchableOpacity>
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
              <TouchableOpacity 
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.quantityButton}
                accessibilityLabel="Decrease quantity"
              >
                <Ionicons name="remove" size={24} color={DESIGN_TOKENS.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                onPress={() => setQuantity(quantity + 1)}
                style={styles.quantityButton}
                accessibilityLabel="Increase quantity"
              >
                <Ionicons name="add" size={24} color={DESIGN_TOKENS.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {item.addons.length > 0 && (
            <View style={styles.addonsSection}>
              <Text style={styles.sectionTitle}>Add-ons</Text>
              {item.addons.map((addon) => (
                <TouchableOpacity
                  key={addon.id}
                  onPress={() => toggleAddon(addon.id)}
                  style={[styles.addonItem, selectedAddons.includes(addon.id) && styles.addonItemSelected]}
                  accessibilityLabel={`Add ${addon.name}`}
                >
                  <View style={styles.addonInfo}>
                    <Text style={styles.addonName}>{addon.name}</Text>
                    <Text style={styles.addonPrice}>+₹{addon.price}</Text>
                  </View>
                  <View style={[styles.checkbox, selectedAddons.includes(addon.id) && styles.checkboxSelected]}>
                    {selectedAddons.includes(addon.id) && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
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

        <TouchableOpacity 
          onPress={handleAddToCart}
          style={styles.addToCartButton}
          accessibilityLabel="Add to cart"
        >
          <Text style={styles.addToCartButtonText}>Add to Cart - ₹{calculateTotalPrice()}</Text>
        </TouchableOpacity>
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
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  backButton: {
    padding: DESIGN_TOKENS.spacing.xs,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
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
  },
  itemName: {
    fontSize: 20,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  itemDescription: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  itemPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    marginTop: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: DESIGN_TOKENS.spacing.sm,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  quantitySection: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    marginBottom: DESIGN_TOKENS.spacing.md,
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
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  addonsSection: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  addonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  addonItemSelected: {
    backgroundColor: DESIGN_TOKENS.colors.primary + '10',
  },
  addonInfo: {
    flex: 1,
  },
  addonName: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  addonPrice: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 2,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    borderRadius: DESIGN_TOKENS.radius.input,
    padding: DESIGN_TOKENS.spacing.sm,
    fontSize: 16,
    marginTop: DESIGN_TOKENS.spacing.sm,
    minHeight: 80,
    textAlignVertical: 'top',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  addToCartButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    padding: DESIGN_TOKENS.spacing.md,
    margin: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default MenuItemCustomizationScreen;