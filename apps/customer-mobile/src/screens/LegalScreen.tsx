import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { Easing } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../constants/api';
import Toast from 'react-native-root-toast';
import { useLegalDocument } from '../hooks/useLegalDocument';

interface PolicyLink {
  id: string;
  title: string;
  icon: string;
  url: string;
  accessibilityLabel: string;
}

const POLICY_LINKS: PolicyLink[] = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    icon: 'lock-closed-outline',
    url: '/privacy-policy',
    accessibilityLabel: 'Read Privacy Policy',
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    icon: 'document-text-outline',
    url: '/terms-of-service',
    accessibilityLabel: 'Read Terms of Service',
  },
  {
    id: 'cookies',
    title: 'Cookie Policy',
    icon: 'cookie-outline',
    url: '/cookie-policy',
    accessibilityLabel: 'Read Cookie Policy',
  },
  {
    id: 'retention',
    title: 'Data Retention Policy',
    icon: 'time-outline',
    url: '/data-retention-policy',
    accessibilityLabel: 'Read Data Retention Policy',
  },
  {
    id: 'security',
    title: 'Security Center',
    icon: 'shield-checkmark-outline',
    url: '/security-center',
    accessibilityLabel: 'Visit Security Center',
  },
];

const handlePolicyPress = async (url: string) => {
  try {
    const fullUrl = `${API_BASE_URL}${url}`;
    const canOpen = await Linking.canOpenURL(fullUrl);
    if (canOpen) {
      await Linking.openURL(fullUrl);
    } else {
      Toast.show('Unable to open this link', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.warning,
        textColor: 'white',
      });
    }
  } catch {
    Toast.show('Failed to open link', {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      backgroundColor: DESIGN_TOKENS.colors.danger,
      textColor: 'white',
    });
  }
};

const LegalScreen = () => {
  const navigation = useNavigation();
  const { agreement, loading, error, fadeAnim, retry } = useLegalDocument();

  if (loading) {
    return (
      <View style={styles.loadingContainer}
        accessible={true}
        accessibilityLabel="Loading legal document"
        accessibilityRole="progressbar"
      >
        <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
        <Text style={styles.loadingText}>Loading legal document...</Text>
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
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={DESIGN_TOKENS.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerText}>Legal</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={DESIGN_TOKENS.colors.danger} />
              <Text style={styles.errorTitle}>Unable to load document</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <Pressable
                style={styles.retryButton}
                onPress={retry}
                accessibilityLabel="Retry loading document"
                accessibilityRole="button"
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </Pressable>
            </View>
          ) : agreement ? (
            <View style={styles.agreementContainer}>
              <View style={styles.agreementHeader}>
                <Text style={styles.agreementTitle}>{agreement.title}</Text>
                <View style={styles.agreementMeta}>
                  <Text style={styles.agreementVersion}>Version {agreement.version}</Text>
                  <Text style={styles.agreementDot}>â€¢</Text>
                  <Text style={styles.agreementDate}>Effective {agreement.effectiveDate}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <ScrollView style={styles.documentContent} nestedScrollEnabled>
                <Text style={styles.documentText}>{agreement.content}</Text>
              </ScrollView>

              <View style={styles.divider} />

              <View style={styles.policiesSection}>
                <Text style={styles.policiesTitle}>Related Policies</Text>
                {POLICY_LINKS.map((policy) => (
                  <Pressable
                    key={policy.id}
                    style={styles.policyItem}
                    onPress={() => handlePolicyPress(policy.url)}
                    accessibilityLabel={policy.accessibilityLabel}
                    accessibilityRole="link"
                  >
                    <View style={styles.policyIconContainer}>
                      <Ionicons name={policy.icon} size={22} color={DESIGN_TOKENS.colors.primary} />
                    </View>
                    <Text style={styles.policyTitle}>{policy.title}</Text>
                    <Ionicons name="chevron-forward" size={20} color={DESIGN_TOKENS.colors.textTertiary} />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color={DESIGN_TOKENS.colors.textTertiary} />
              <Text style={styles.emptyText}>No legal document available</Text>
            </View>
          )}
        </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DESIGN_TOKENS.colors.background,
    gap: DESIGN_TOKENS.spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    paddingTop: DESIGN_TOKENS.spacing.lg,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DESIGN_TOKENS.radius.sm,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: DESIGN_TOKENS.spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DESIGN_TOKENS.spacing.xxl,
    gap: DESIGN_TOKENS.spacing.md,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  errorMessage: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  retryButton: {
    marginTop: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: DESIGN_TOKENS.spacing.md,
    paddingHorizontal: DESIGN_TOKENS.spacing.xl,
    borderRadius: DESIGN_TOKENS.radius.button,
    ...DESIGN_TOKENS.shadows.small,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  agreementContainer: {
    gap: DESIGN_TOKENS.spacing.md,
  },
  agreementHeader: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  agreementTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  agreementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  agreementVersion: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  agreementDot: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textTertiary,
  },
  agreementDate: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  divider: {
    height: 1,
    backgroundColor: DESIGN_TOKENS.colors.borderLight,
  },
  documentContent: {
    maxHeight: 400,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
  },
  documentText: {
    fontSize: 15,
    lineHeight: 22,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  policiesSection: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  policiesTitle: {
    fontSize: 13,
    fontWeight: '600',
    padding: DESIGN_TOKENS.spacing.md,
    paddingBottom: DESIGN_TOKENS.spacing.xs,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  policyIconContainer: {
    width: 36,
    height: 36,
    borderRadius: DESIGN_TOKENS.radius.sm,
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DESIGN_TOKENS.spacing.sm,
  },
  policyTitle: {
    flex: 1,
    fontSize: 15,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DESIGN_TOKENS.spacing.xxl,
    gap: DESIGN_TOKENS.spacing.md,
  },
  emptyText: {
    fontSize: 15,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default LegalScreen;