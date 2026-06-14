import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';

export const HelpScreen = ({ navigation }: { navigation: { goBack: () => void } }) => {
  const handleCallSupport = () => {
    Linking.openURL('tel:+18001234567');
  };

  const handleEmergency = () => {
    Linking.openURL('tel:112');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={navigation.goBack}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Support</Text>
        <Pressable style={styles.menuItem} onPress={handleCallSupport}>
          <Text style={styles.menuText}>📞 Call Support (24/7)</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>💬 Chat with Support</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety</Text>
        <Pressable style={[styles.menuItem, styles.emergencyButton]} onPress={handleEmergency}>
          <Text style={[styles.menuText, styles.emergencyText]}>🚨 Emergency Assistance</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FAQs</Text>
        <Pressable style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I update my bank details?</Text>
          <Text style={styles.faqAnswer}>Go to Profile → Bank Account to update your payout details.</Text>
        </Pressable>
        <Pressable style={styles.faqItem}>
          <Text style={styles.faqQuestion}>What happens if I reject orders?</Text>
          <Text style={styles.faqAnswer}>Repeated rejections may affect your driver score and earnings.</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
  },
  backButton: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginLeft: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  section: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    margin: DESIGN_TOKENS.spacing.md,
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
  menuItem: {
    padding: DESIGN_TOKENS.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  menuText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  emergencyButton: {
    backgroundColor: DESIGN_TOKENS.colors.danger + '20',
    borderRadius: DESIGN_TOKENS.radius.sm,
  },
  emergencyText: {
    color: DESIGN_TOKENS.colors.danger,
    fontWeight: '600',
  },
  faqItem: {
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '500',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  faqAnswer: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default HelpScreen;