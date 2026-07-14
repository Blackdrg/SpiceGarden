import React from 'react';
import { View, Text, Pressable, Linking, Alert, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { Screen, CardView } from '../components/Screen';
import type { ScreenProps } from '../types';

const supportTopics = [
  { title: 'Call Support', subtitle: '24/7 helpline available', icon: 'call-outline', color: DESIGN_TOKENS.colors.success, action: () => Linking.openURL('tel:+919876543210') },
  { title: 'Email Us', subtitle: 'support@spicegarden.com', icon: 'mail-outline', color: DESIGN_TOKENS.colors.info, action: () => Linking.openURL('mailto:support@spicegarden.com') },
  { title: 'FAQ', subtitle: 'Common questions answered', icon: 'help-circle-outline', color: DESIGN_TOKENS.colors.warning, action: () => Alert.alert('FAQ', 'Please visit our help center for common questions.') },
];

export default function SupportScreen(_props: ScreenProps): React.JSX.Element {
  return (
    <Screen title="Support" navigation={_props.navigation}>
      <CardView style={styles.emergencyCard}>
        <View style={styles.emergencyHeader}>
          <View style={[styles.emergencyIconContainer, { backgroundColor: DESIGN_TOKENS.colors.warningLight }]}>
            <Ionicons name="warning-outline" size={24} color={DESIGN_TOKENS.colors.warning} />
          </View>
          <View style={styles.emergencyTextContainer}>
            <Text style={styles.emergencyTitle}>Emergency</Text>
            <Text style={styles.emergencyText}>If you are in danger or need immediate assistance, contact local authorities.</Text>
          </View>
        </View>
        <Pressable style={styles.emergencyButton} onPress={() => Linking.openURL('tel:108')}>
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.emergencyButtonText}>Call 108</Text>
        </Pressable>
      </CardView>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help Topics</Text>
        <CardView style={styles.topicsCard}>
          {supportTopics.map((topic, index) => (
            <Pressable
              key={topic.title}
              onPress={topic.action}
              style={[
                styles.topicRow,
                index < supportTopics.length - 1 && styles.topicRowBorder,
              ]}
            >
              <View style={[styles.topicIconContainer, { backgroundColor: topic.color + '15' }]}>
                <Ionicons name={topic.icon as any} size={20} color={topic.color} />
              </View>
              <View style={styles.topicInfo}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicSubtitle}>{topic.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={DESIGN_TOKENS.colors.textTertiary} />
            </Pressable>
          ))}
        </CardView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emergencyCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.lg,
    marginBottom: DESIGN_TOKENS.spacing.lg,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.warningLight,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  emergencyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: DESIGN_TOKENS.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTextContainer: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.warningDark,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    lineHeight: 18,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
    backgroundColor: DESIGN_TOKENS.colors.danger,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    borderRadius: DESIGN_TOKENS.radius.button,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  section: {
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: DESIGN_TOKENS.spacing.sm,
    paddingHorizontal: DESIGN_TOKENS.spacing.sm,
  },
  topicsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DESIGN_TOKENS.spacing.md,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    gap: DESIGN_TOKENS.spacing.sm,
  },
  topicRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  topicIconContainer: {
    width: 36,
    height: 36,
    borderRadius: DESIGN_TOKENS.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  topicSubtitle: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: 1,
  },
});
