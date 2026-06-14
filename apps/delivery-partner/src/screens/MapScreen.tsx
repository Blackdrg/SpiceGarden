import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { MapView, Marker, Polyline } from 'react-native-maps';

interface Location {
  lat: number;
  lng: number;
}

interface DeliveryStage {
  stage: 'pickup' | 'delivery';
  location: Location;
}

export const MapScreen = ({ route }: { 
  route: { params: { 
    currentLocation: Location;
    destination: Location;
    pickup?: Location;
    stage: 'pickup' | 'delivery';
  }} 
}) => {
  const { currentLocation, destination, pickup } = route.params;
  const [heading, setHeading] = useState(0);
  const [eta, setEta] = useState(15);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => pulseAnim.stopAnimation();
  }, [pulseAnim]);

  const region = {
    latitude: currentLocation?.lat || 30.7333,
    longitude: currentLocation?.lng || 76.7794,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        followsUserLocation
      >
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.lat,
              longitude: currentLocation.lng,
            }}
            title="Current Location"
          >
            <Animated.View style={{
              transform: [{ scale: pulseAnim }],
              backgroundColor: DESIGN_TOKENS.colors.primary,
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={styles.markerIcon}>🏍</Text>
            </Animated.View>
          </Marker>
        )}

        {destination && (
          <Marker
            coordinate={{
              latitude: destination.lat,
              longitude: destination.lng,
            }}
            title="Destination"
            pinColor={DESIGN_TOKENS.colors.success}
          />
        )}

        {pickup && (
          <Marker
            coordinate={{
              latitude: pickup.lat,
              longitude: pickup.lng,
            }}
            title="Pickup"
            pinColor={DESIGN_TOKENS.colors.warning}
          />
        )}

        {pickup && destination && (
          <Polyline
            coordinates={[
              { latitude: pickup.lat, longitude: pickup.lng },
              { latitude: destination.lat, longitude: destination.lng },
            ]}
            strokeColor={DESIGN_TOKENS.colors.primary}
            strokeWidth={3}
          />
        )}
      </MapView>

      <View style={styles.bottomSheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Navigation</Text>
        </View>

        <View style={styles.etacontainer}>
          <Text style={styles.etaLabel}>ETA</Text>
          <Text style={styles.etaValue}>{eta} min</Text>
        </View>

        <View style={styles.directionContainer}>
          <Text style={styles.directionText}>
            Head towards {pickup ? 'the restaurant' : 'customer location'}
          </Text>
        </View>

        <Pressable style={styles.gpsButton}>
          <Text style={styles.gpsButtonText}>📍 Recenter Map</Text>
        </Pressable>
      </View>
    </View>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderTopLeftRadius: DESIGN_TOKENS.radius.card,
    borderTopRightRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.lg,
    boxShadow: '0 -4px 16px rgba(0,0,0,0.16)',
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  etacontainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  etaLabel: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginRight: DESIGN_TOKENS.spacing.sm,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  etaValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  directionContainer: {
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.md,
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  directionText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textPrimary,
    textAlign: 'center',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  gpsButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 12,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
  },
  gpsButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  markerIcon: {
    fontSize: 20,
  },
});

export default MapScreen;