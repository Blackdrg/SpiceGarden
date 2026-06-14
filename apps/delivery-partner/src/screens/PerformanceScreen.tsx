import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';

const performanceData = {
  rating: 4.8,
  onTimeRate: 95,
  acceptanceRate: 90,
  cancellationRate: 5,
  totalDeliveries: 1247,
  thisWeek: 42,
  rank: 'Gold',
};

export const PerformanceScreen = ({ navigation }: { navigation: { goBack: () => void } }) => {

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Performance</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.rankCard}>
          <Text style={styles.rankBadge}>{performanceData.rank} Tier</Text>
          <Text style={styles.ratingValue}>{performanceData.rating} ★</Text>
          <Text style={styles.ratingLabel}>Your Rating</Text>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{performanceData.onTimeRate}%</Text>
            <Text style={styles.metricLabel}>On Time Rate</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{performanceData.acceptanceRate}%</Text>
            <Text style={styles.metricLabel}>Acceptance Rate</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{performanceData.cancellationRate}%</Text>
            <Text style={styles.metricLabel}>Cancellation Rate</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{performanceData.thisWeek}</Text>
            <Text style={styles.metricLabel}>This Week</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Improve</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>Accept more orders during high-demand hours for bonus payouts</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  header: {
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  content: {
    flex: 1,
    padding: DESIGN_TOKENS.spacing.md,
  },
  rankCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.xl,
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  rankBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.primary,
    marginBottom: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  ratingLabel: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DESIGN_TOKENS.spacing.sm,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  metricLabel: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  section: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.sm,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: DESIGN_TOKENS.spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default PerformanceScreen;