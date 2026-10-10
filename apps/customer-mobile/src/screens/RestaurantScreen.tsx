import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Animated, Easing } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';

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
   const [cartCount, setCartCount] = useState(0);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [addingItem, setAddingItem] = useState<string | null>(null);
   
   const fadeAnim = useMemo(() => new Animated.Value(0), []);
   const scaleAnims = useMemo(() => new Map<string, Animated.Value>(), []);

   useEffect(() => {
     const loadData = async () => {
       try {
         const restaurants: Record<string, RestaurantInfo> = {
           'rest-001': { id: 'rest-001', name: 'SpiceGarden Signature Kitchen', rating: 4.9, deliveryTime: '20-25 min', address: 'Plot 12, Sector 17, Chandigarh' },
           'rest-002': { id: 'rest-002', name: 'Punjab Grill & Curry House', rating: 4.8, deliveryTime: '25-30 min', address: 'Phase 7, Mohali' },
           'rest-003': { id: 'rest-003', name: 'Artisan Woodfired Pizzeria', rating: 4.8, deliveryTime: '20-25 min', address: 'Sector 35, Chandigarh' },
         };
         
         setRestaurant(restaurants[restaurantId!] || restaurants['rest-001']);
         
         let items: MenuItem[] = [];
         if (restaurantId === 'rest-002') {
           items = [
             { id: 'item-007', name: 'Mughlai Butter Chicken Boneless', description: 'Tender chicken tikka simmered in creamy makhani gravy', price: 290, category: 'Curries', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80' },
             { id: 'item-008', name: 'Dal Makhani Slow-Simmered', description: 'Overnight black lentils with fresh churned butter', price: 220, category: 'Curries', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80' },
           ];
         } else if (restaurantId === 'rest-003') {
           items = [
             { id: 'item-013', name: 'Artisan Burrata Truffle Pizza', description: 'Sourdough crust, fresh burrata, San Marzano tomatoes, truffle glaze', price: 499, category: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80' },
           ];
         } else {
           items = [
             { id: 'item-001', name: 'Special Handi Chicken Biryani', description: 'Slow-cooked in clay pot with aged basmati rice, saffron & spiced chicken', price: 320, category: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80' },
             { id: 'item-002', name: 'Garlic Butter Naan (Clay Oven)', description: 'Traditional clay-tandoor baked soft flatbread with roasted garlic', price: 65, category: 'Breads', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80' },
           ];
         }
         
         setMenuItems(items);
         setLoading(false);
         
         Animated.timing(fadeAnim, {
           toValue: 1,
           duration: 300,
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
      setCartCount(c => c + 1);
      setTimeout(() => setAddingItem(null), 500);
    };

    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
          <Text style={styles.loadingText}>Loading menu...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {restaurant && (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>{restaurant.name}</Text>
              <Text style={styles.subtitle}>{restaurant.deliveryTime} • {restaurant.address}</Text>
            </View>
            <Animated.View style={[styles.menuContainer, { opacity: fadeAnim }]}>
              {menuItems.map(item => (
                <Pressable
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => addToCart(item.id)}
                >
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                  {addingItem === item.id && (
                    <Text style={styles.addedIndicator}>✓ Added</Text>
                  )}
                </Pressable>
              ))}
            </Animated.View>
          </>
        )}
      </View>
    );
};

export default RestaurantScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DESIGN_TOKENS.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: DESIGN_TOKENS.colors.textSecondary, marginTop: 12 },
  errorText: { color: DESIGN_TOKENS.colors.danger },
  header: { padding: 16, backgroundColor: DESIGN_TOKENS.colors.surface, borderBottomWidth: 1, borderBottomColor: DESIGN_TOKENS.colors.border },
  title: { fontSize: 24, fontWeight: 'bold', color: DESIGN_TOKENS.colors.textPrimary },
  subtitle: { color: DESIGN_TOKENS.colors.textSecondary, marginTop: 4 },
  menuContainer: { padding: 16 },
  menuItem: { padding: 16, backgroundColor: DESIGN_TOKENS.colors.surface, borderRadius: DESIGN_TOKENS.radius.md, borderWidth: 1, borderColor: DESIGN_TOKENS.colors.border, marginBottom: 12 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: DESIGN_TOKENS.colors.textPrimary },
  itemDescription: { color: DESIGN_TOKENS.colors.textSecondary, marginTop: 4 },
  itemPrice: { color: DESIGN_TOKENS.colors.primary, marginTop: 8, fontWeight: 'bold' },
  addedIndicator: { color: DESIGN_TOKENS.colors.success, marginTop: 8, fontWeight: '600' },
});
