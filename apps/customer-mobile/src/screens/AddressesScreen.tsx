import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Animated, Easing, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { STORAGE_KEYS } from '../constants/storage.keys';

interface Address {
  id: string;
  label: string;
  address: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export const AddressesScreen = () => {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
    } catch (e) {
      console.error('Location permission error:', e);
    }
  };

  const loadAddresses = useCallback(async () => {
    try {
      const addressesJson = await AsyncStorage.getItem(STORAGE_KEYS.ADDRESSES);
      if (addressesJson) {
        const parsed = JSON.parse(addressesJson) as Address[];
        if (Array.isArray(parsed)) {
          setAddresses(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load addresses:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveAddresses = useCallback(async (newAddresses: Address[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(newAddresses));
      setAddresses(newAddresses);
    } catch (e) {
      console.error('Failed to save addresses:', e);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
    requestLocationPermission();
  }, [loadAddresses]);

  const getCurrentLocation = useCallback(async () => {
    if (locationPermission !== 'granted') {
      Alert.alert('Permission Required', 'Location permission is needed to add your current address');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      const newAddress: Address = {
        id: Date.now().toString(),
        label: 'Current Location',
        address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
        latitude,
        longitude,
      };
      
      saveAddresses([...addresses, newAddress]);
    } catch (e) {
      Alert.alert('Error', 'Could not get your current location');
    }
  }, [addresses, locationPermission, saveAddresses]);

  const deleteAddress = useCallback((id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const newAddresses = addresses.filter(a => a.id !== id);
            saveAddresses(newAddresses);
          }
        },
      ]
    );
  }, [addresses, saveAddresses]);

  const setDefaultAddress = useCallback((id: string) => {
    const newAddresses = addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    saveAddresses(newAddresses);
  }, [addresses, saveAddresses]);

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <Text style={styles.addressLabel}>{item.label}</Text>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>
      <Text style={styles.addressText} numberOfLines={2}>{item.address}</Text>
      <View style={styles.addressActions}>
        {!item.isDefault && (
          <Pressable 
            onPress={() => setDefaultAddress(item.id)}
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>Set Default</Text>
          </Pressable>
        )}
        <Pressable 
          onPress={() => deleteAddress(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash" size={16} color={DESIGN_TOKENS.colors.danger} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: DESIGN_TOKENS.motion.page,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [loading, fadeAnim]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.loadingSkeleton} />
          <View style={styles.loadingSkeleton} />
          <View style={styles.loadingSkeleton} />
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={DESIGN_TOKENS.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerText}>Saved Addresses</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={renderAddressItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={64} color={DESIGN_TOKENS.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Addresses Saved</Text>
              <Text style={styles.emptyText}>Add addresses for faster checkout</Text>
            </View>
          }
        />

        <Pressable 
          style={styles.addButton}
          onPress={() => Alert.alert('Add Address', 'Address form would go here')}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Address</Text>
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
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  loadingContent: {
    padding: DESIGN_TOKENS.spacing.md,
    gap: DESIGN_TOKENS.spacing.md,
  },
  loadingSkeleton: {
    height: 100,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    borderRadius: DESIGN_TOKENS.radius.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  listContent: {
    flexGrow: 1,
    padding: DESIGN_TOKENS.spacing.md,
  },
  addressCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  defaultBadge: {
    backgroundColor: DESIGN_TOKENS.colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DESIGN_TOKENS.radius.sm,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.success,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  addressText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: DESIGN_TOKENS.radius.sm,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
  },
  actionButtonText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: DESIGN_TOKENS.radius.sm,
    backgroundColor: DESIGN_TOKENS.colors.danger + '10',
  },
  deleteButtonText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.danger,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginTop: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  emptyText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 14,
    margin: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.button,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default AddressesScreen;
