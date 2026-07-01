import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Animated, Easing } from 'react-native';

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
             { id: 'item-001', name: 'Whopper', description: 'Flame-grilled beef patty with fresh lettude', price: 149, category: 'burgers', image: 'https://example.com/whopper.jpg' },
             { id: 'item-002', name: 'Double Whopper', description: 'Two flame-grilled beef patties', price: 199, category: 'burgers', image: 'https://example.com/double-whopper.jpg' },
           ];
         } else if (restaurantId === 'rest-002') {
           items = [
             { id: 'item-007', name: 'Margherita Pizza', description: 'Fresh mozzarella & tomatoes', price: 299, category: 'pizza', image: 'https://example.com/margherita.jpg' },
           ];
         } else {
           items = [
             { id: 'item-013', name: 'Chicken Teriyaki', description: 'Grilled chicken with teriyaki sauce', price: 249, category: 'sandwiches', image: 'https://example.com/chicken-teriyaki.jpg' },
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
          <ActivityIndicator size="large" color="#f97316" />
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
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#888', marginTop: 12 },
  errorText: { color: '#ff4444' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: '#888', marginTop: 4 },
  menuContainer: { padding: 16 },
  menuItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  itemDescription: { color: '#888', marginTop: 4 },
  itemPrice: { color: '#f97316', marginTop: 8, fontWeight: 'bold' },
  addedIndicator: { color: '#4caf50', marginTop: 8 },
});
