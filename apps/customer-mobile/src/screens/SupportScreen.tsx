import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { STRINGS } from '../constants/strings';
import Toast from 'react-native-root-toast';
import { supportService, SupportCategory } from '../services/support.service';
import { STORAGE_KEYS } from '../constants/storage.keys';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES: { id: SupportCategory; label: string; icon: any }[] = [
  { id: 'order_issue', label: 'Order Issue', icon: 'receipt-outline' },
  { id: 'payment_issue', label: 'Payment Issue', icon: 'card-outline' },
  { id: 'delivery_issue', label: 'Delivery Issue', icon: 'bicycle-outline' },
  { id: 'refund_request', label: 'Refund Request', icon: 'cash-outline' },
  { id: 'app_issue', label: 'App Issue', icon: 'bug-outline' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

const SupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [category, setCategory] = useState<SupportCategory | null>(null);
  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!category) {
      Toast.show('Please select a category', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.danger,
        textColor: 'white',
      });
      return;
    }
    if (description.trim().length < 10) {
      Toast.show('Please describe your issue (min 10 characters)', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.danger,
        textColor: 'white',
      });
      return;
    }

    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    const user = userJson ? JSON.parse(userJson) : null;
    const customerId = user?.id || user?.email || 'guest';

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitting(true);
    try {
      const result = await supportService.raiseTicket({
        orderId: orderId.trim() || 'N/A',
        customerId,
        type: category,
        description: description.trim(),
      });
      setSubmitted(result.id || 'SUBMITTED');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show('Support request submitted', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.success,
        textColor: 'white',
      });
    } catch (err: any) {
      Toast.show(err?.message || 'Failed to submit. Please try again.', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.danger,
        textColor: 'white',
      });
    } finally {
      setSubmitting(false);
    }
  }, [category, orderId, description]);

  const reset = useCallback(() => {
    setSubmitted(null);
    setCategory(null);
    setOrderId('');
    setDescription('');
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel={STRINGS.accessibility.backButton}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back-outline" size={24} color={DESIGN_TOKENS.colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Help & Support</Text>
      </View>

      {submitted ? (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle-outline" size={64} color={DESIGN_TOKENS.colors.success} />
          <Text style={styles.successTitle}>Request Submitted</Text>
          <Text style={styles.successText}>Ticket reference: {submitted}</Text>
          <Text style={styles.successSubtext}>Our team will contact you shortly.</Text>
          <Pressable
            onPress={reset}
            style={styles.primaryButton}
            accessibilityLabel="Raise another request"
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Raise Another</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.form}>
          <Text style={styles.label}>What can we help with?</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.id}
                style={[styles.categoryCard, category === c.id ? styles.categorySelected : null]}
                onPress={() => setCategory(c.id)}
                accessibilityLabel={c.label}
                accessibilityRole="button"
                accessibilityState={{ selected: category === c.id }}
              >
                <Ionicons
                  name={c.icon}
                  size={22}
                  color={category === c.id ? 'white' : DESIGN_TOKENS.colors.primary}
                />
                <Text style={[styles.categoryText, category === c.id ? styles.categoryTextSelected : null]}>
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Order ID (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. ORD-12345"
            value={orderId}
            onChangeText={setOrderId}
            autoCapitalize="none"
            accessibilityLabel="Order ID"
          />

          <Text style={styles.label}>Describe your issue</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us what happened..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            accessibilityLabel="Description"
          />

          <Pressable
            style={[styles.primaryButton, submitting ? styles.primaryButtonDisabled : null]}
            onPress={handleSubmit}
            disabled={submitting}
            accessibilityLabel="Submit support request"
            accessibilityRole="button"
            accessibilityState={{ disabled: submitting }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.primaryButtonText}>Submit Request</Text>
            )}
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DESIGN_TOKENS.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    paddingTop: DESIGN_TOKENS.spacing.lg,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  backButton: { padding: DESIGN_TOKENS.spacing.xs },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginLeft: DESIGN_TOKENS.spacing.sm,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  form: { padding: DESIGN_TOKENS.spacing.md },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: DESIGN_TOKENS.spacing.sm,
    marginTop: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: DESIGN_TOKENS.spacing.sm },
  categoryCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
  },
  categorySelected: { backgroundColor: DESIGN_TOKENS.colors.primary, borderColor: DESIGN_TOKENS.colors.primary },
  categoryText: { fontSize: 13, color: DESIGN_TOKENS.colors.textPrimary, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  categoryTextSelected: { color: 'white' },
  input: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.lg,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    fontSize: 15,
    color: DESIGN_TOKENS.colors.textPrimary,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  textArea: { height: 120, paddingTop: DESIGN_TOKENS.spacing.sm },
  primaryButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 14,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
    marginTop: DESIGN_TOKENS.spacing.lg,
  },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '700', fontFamily: DESIGN_TOKENS.typography.fontFamily },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: DESIGN_TOKENS.spacing.xl },
  successTitle: { fontSize: 20, fontWeight: '700', color: DESIGN_TOKENS.colors.textPrimary, marginTop: DESIGN_TOKENS.spacing.md, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  successText: { fontSize: 14, color: DESIGN_TOKENS.colors.textSecondary, marginTop: DESIGN_TOKENS.spacing.sm, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  successSubtext: { fontSize: 13, color: DESIGN_TOKENS.colors.textSecondary, marginTop: 4, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  successContainerMt: { marginTop: DESIGN_TOKENS.spacing.lg },
});

export default SupportScreen;
