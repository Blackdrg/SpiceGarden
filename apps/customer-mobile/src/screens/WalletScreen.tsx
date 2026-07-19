import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { STRINGS } from '../constants/strings';
import { useWallet } from '../hooks/useWallet';
import { LoadingState } from '../components/LoadingState';
import { WalletTransaction } from '../services/wallet.service';

const WalletScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    wallet,
    transactions,
    formattedBalance,
    loading,
    refreshing,
    error,
    hasMore,
    loadingMore,
    onRefresh,
    loadMore,
    handleRetry,
  } = useWallet();

  const renderTransaction = useCallback(
    ({ item }: { item: WalletTransaction }) => {
      const isCredit = ['credit', 'refund', 'cashback', 'cod_collection', 'compensation'].includes(
        item.type
      );
      return (
        <View style={styles.txnRow}>
          <View style={styles.txnIcon}>
            <Ionicons
              name={isCredit ? 'arrow-down-outline' : 'arrow-up-outline'}
              size={18}
              color={isCredit ? DESIGN_TOKENS.colors.success : DESIGN_TOKENS.colors.danger}
            />
          </View>
          <View style={styles.txnInfo}>
            <Text style={styles.txnDesc} numberOfLines={1}>
              {item.description || STRINGS.wallet.type[item.type] || item.type}
            </Text>
            <Text style={styles.txnDate}>
              {new Date(item.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          <Text
            style={[styles.txnAmount, isCredit ? styles.txnCredit : styles.txnDebit]}
          >
            {isCredit ? '+' : '-'}₹{Number(item.amount).toFixed(2)}
          </Text>
        </View>
      );
    },
    []
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={DESIGN_TOKENS.colors.primary} />
      </View>
    );
  };

  if (loading) {
    return <LoadingState showText={true} />;
  }

  if (error && transactions.length === 0) {
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
          <Text style={styles.title}>{STRINGS.wallet.title}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={handleRetry}
            style={styles.primaryButton}
            accessibilityLabel={STRINGS.wallet.retry}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>{STRINGS.wallet.retry}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

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
        <Text style={styles.title}>{STRINGS.wallet.title}</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DESIGN_TOKENS.colors.primary} />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>{STRINGS.wallet.balanceLabel}</Text>
              <Text style={styles.balanceValue}>{formattedBalance}</Text>
            </View>

            <Text style={styles.sectionTitle}>{STRINGS.wallet.title} Activity</Text>
            {transactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{STRINGS.wallet.empty}</Text>
                <Text style={styles.emptySubtext}>{STRINGS.wallet.emptySubtext}</Text>
              </View>
            ) : null}
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
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
  balanceCard: {
    margin: DESIGN_TOKENS.spacing.md,
    padding: DESIGN_TOKENS.spacing.lg,
    backgroundColor: DESIGN_TOKENS.colors.primary,
    borderRadius: DESIGN_TOKENS.radius.card,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginVertical: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginTop: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  listContent: { paddingBottom: DESIGN_TOKENS.spacing.xl },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  txnIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txnInfo: { flex: 1, marginLeft: DESIGN_TOKENS.spacing.sm },
  txnDesc: { fontSize: 14, color: DESIGN_TOKENS.colors.textPrimary, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  txnDate: { fontSize: 12, color: DESIGN_TOKENS.colors.textSecondary, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  txnAmount: { fontSize: 14, fontWeight: '700', fontFamily: DESIGN_TOKENS.typography.fontFamily },
  txnCredit: { color: DESIGN_TOKENS.colors.success },
  txnDebit: { color: DESIGN_TOKENS.colors.danger },
  emptyContainer: { alignItems: 'center', padding: DESIGN_TOKENS.spacing.xl },
  emptyText: { fontSize: 16, color: DESIGN_TOKENS.colors.textPrimary, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  emptySubtext: { fontSize: 13, color: DESIGN_TOKENS.colors.textSecondary, marginTop: 4, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: DESIGN_TOKENS.spacing.lg },
  errorText: { fontSize: 16, color: DESIGN_TOKENS.colors.danger, marginBottom: 20, textAlign: 'center', fontFamily: DESIGN_TOKENS.typography.fontFamily },
  primaryButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: DESIGN_TOKENS.radius.button,
  },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '600', fontFamily: DESIGN_TOKENS.typography.fontFamily },
  footerLoader: { padding: DESIGN_TOKENS.spacing.md, alignItems: 'center' },
});

export default WalletScreen;
