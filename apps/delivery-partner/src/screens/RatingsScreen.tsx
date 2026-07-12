import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { Screen, CardView } from '../components/Screen';
import { LoadingSpinner, ErrorState, EmptyState } from '../components/Indicators';
import type { ScreenProps } from '../types';

export default function RatingsScreen(_props: ScreenProps): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Screen title="Ratings" navigation={_props.navigation}>
        <LoadingSpinner label="Loading ratings…" />
      </Screen>
    );
  }

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? 'star' : 'star-outline'}
          size={28}
          color={i <= Math.round(rating) ? DESIGN_TOKENS.colors.warning : DESIGN_TOKENS.colors.border}
        />
      );
    }
    return stars;
};

  return (
    <Screen title="Ratings" navigation={_props.navigation}>
      <CardView style={styles.ratingHeroCard}>
        <View style={styles.starsRow}>
          {renderStars(rating || 0)}
        </View>
        <Text style={styles.ratingScore}>{rating?.toFixed(1)}</Text>
        <Text style={styles.ratingCount}>No ratings yet</Text>
      </CardView>
      <EmptyState 
        title="No feedback yet" 
        message="Customer ratings and feedback will appear here after deliveries."
      />
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
