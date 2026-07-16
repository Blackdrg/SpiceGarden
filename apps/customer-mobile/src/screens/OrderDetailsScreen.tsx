import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const OrderDetailsScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const order = route?.params?.order;
  
  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={DESIGN_TOKENS.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="receipt-outline" size={40} color={DESIGN_TOKENS.colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No Order Selected</Text>
          <Text style={styles.emptyText}>Select an order from your history to view details.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={DESIGN_TOKENS.colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: DESIGN_TOKENS.spacing.xl, paddingHorizontal: DESIGN_TOKENS.spacing.md }}>
        <View style={[styles.statusCard, { backgroundColor: DESIGN_TOKENS.colors.warningLight }]}>
          <Ionicons name="time-outline" size={16} color={DESIGN_TOKENS.colors.warning} />
          <Text style={[styles.statusText, { color: DESIGN_TOKENS.colors.warningDark }]}>
            {order.status || 'Preparing'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <OrderDetailRow icon="receipt-outline" label="Order ID" value={`#${order.orderId?.slice(0, 8) || 'N/A'}`} />
          <OrderDetailRow icon="calendar-outline" label="Date" value={order.date || 'Today'} />
          <OrderDetailRow icon="cash-outline" label="Total" value={`₹${order.amount || 0}`} highlight />
        </View>

        <View style={styles.section}>
          <Text style={styles.cardTitle}>Delivery Address</Text>
          <OrderDetailRow icon="location-outline" label="Address" value={order.address || 'Not provided'} />
          <OrderDetailRow icon="call-outline" label="Phone" value={order.phone || 'N/A'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.cardTitle}>Payment</Text>
          <OrderDetailRow icon="card-outline" label="Method" value={order.paymentMethod || 'Cash on Delivery'} />
          <OrderDetailRow icon="checkmark-circle-outline" label="Status" value={order.paymentStatus || 'Pending'} />
        </View>
      </ScrollView>
    </View>
  );
};

const OrderDetailRow = ({ icon, label, value, highlight }: any) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLeft}>
      <View style={styles.detailIconContainer}>
        <Ionicons name={icon} size={16} color={DESIGN_TOKENS.colors.primary} />
      </View>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text style={[styles.detailValue, highlight && styles.detailValueHighlight]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    paddingTop: DESIGN_TOKENS.spacing.lg,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  backButton: {
    padding: DESIGN_TOKENS.spacing.xs,
    marginRight: DESIGN_TOKENS.spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  section: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    borderRadius: DESIGN_TOKENS.radius.full,
    marginBottom: DESIGN_TOKENS.spacing.md,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'capitalize',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: DESIGN_TOKENS.radius.sm,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  detailValueHighlight: {
    color: DESIGN_TOKENS.colors.primary,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: DESIGN_TOKENS.spacing.xxl,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textAlign: 'center',
  },
});

export default OrderDetailsScreen;
