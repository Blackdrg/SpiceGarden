import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { Screen, CardView } from '../components/Screen';
import { EmptyState, LoadingSpinner } from '../components/Indicators';
import { deliveryApi } from '../services/delivery-api.service';
import type { ScreenProps } from '../types';

const renderStars = (rating: number) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const idx = i + 1;
    return (
      <Ionicons
        key={`star-${idx}`}
        name={idx <= Math.round(rating) ? 'star' : 'star-outline'}
        size={28}
        color={idx <= Math.round(rating) ? DESIGN_TOKENS.colors.warning : DESIGN_TOKENS.colors.border}
      />
    );
  });
  return stars;
};

export default function RatingsScreen(_props: ScreenProps): React.JSX.Element {
  const [rating, setRating] = useState<number | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPerformance = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await deliveryApi.getDriverPerformance();
        const driverData = data.rankings?.find((r: any) => r.driverId === data.driverRank) || data.rankings?.[0];
        if (driverData) {
          setRating(driverData.customerRating || 0);
          setRank(data.driverRank || null);
          setTotalDeliveries(driverData.totalDeliveries || 0);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load ratings');
      } finally {
        setLoading(false);
      }
    };

    loadPerformance();
  }, []);

  if (loading) {
    return (
      <Screen title="Ratings" navigation={_props.navigation}>
        <LoadingSpinner label="Loading ratings…" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title="Ratings" navigation={_props.navigation}>
        <EmptyState title="Unable to load ratings" message={error} />
      </Screen>
    );
  }

  return (
    <Screen title="Ratings" navigation={_props.navigation}>
      <CardView style={styles.ratingHeroCard}>
        <View style={styles.starsRow}>
          {renderStars(rating || 0)}
        </View>
        <Text style={styles.ratingScore}>{rating?.toFixed(1) || '0.0'}</Text>
        <Text style={styles.ratingCount}>
          {rank ? `Rank #${rank} · ${totalDeliveries} deliveries` : 'No ratings yet'}
        </Text>
      </CardView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  ratingHeroCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.xl,
    marginBottom: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: DESIGN_TOKENS.spacing.xs,
  },
  ratingScore: {
    fontSize: 48,
    fontWeight: '800',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: DESIGN_TOKENS.spacing.sm,
  },
  ratingCount: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: DESIGN_TOKENS.spacing.xs,
  },
});
