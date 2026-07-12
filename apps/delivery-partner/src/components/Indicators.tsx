import React from 'react';
import { ActivityIndicator, Text, View, TouchableOpacity } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';

export function LoadingSpinner({ label }: { label?: string }): React.JSX.Element {
  return (
    <View style={{ 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: DESIGN_TOKENS.spacing.xl,
      backgroundColor: DESIGN_TOKENS.colors.background,
    }}>
      <ActivityIndicator 
        size="large" 
        color={DESIGN_TOKENS.colors.primary}
        accessibilityLabel="Loading"
      />
      {label ? (
        <Text style={{ 
          marginTop: DESIGN_TOKENS.spacing.md, 
          color: DESIGN_TOKENS.colors.textSecondary,
          fontSize: 14,
          fontFamily: DESIGN_TOKENS.typography.fontFamily,
        }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

export function EmptyState({ title, message, actionLabel, onAction }: { 
  title: string; 
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}): React.JSX.Element {
  return (
    <View style={{ 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: DESIGN_TOKENS.spacing.xxl,
      backgroundColor: DESIGN_TOKENS.colors.background,
    }}>
      <View style={{
        width: 80,
        height: 80,
        borderRadius: DESIGN_TOKENS.radius.full,
        backgroundColor: DESIGN_TOKENS.colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: DESIGN_TOKENS.spacing.lg,
        ...DESIGN_TOKENS.shadows.small,
      }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: DESIGN_TOKENS.radius.lg,
          backgroundColor: DESIGN_TOKENS.colors.borderLight,
        }} />
      </View>
      <Text style={{ 
        fontSize: 18, 
        fontWeight: '600', 
        color: DESIGN_TOKENS.colors.textPrimary, 
        marginBottom: DESIGN_TOKENS.spacing.xs,
        fontFamily: DESIGN_TOKENS.typography.fontFamily,
        textAlign: 'center',
      }}>
        {title}
      </Text>
      {message ? (
        <Text style={{ 
          textAlign: 'center',
          color: DESIGN_TOKENS.colors.textSecondary,
          fontSize: 14,
          fontFamily: DESIGN_TOKENS.typography.fontFamily,
          lineHeight: 20,
          marginBottom: actionLabel ? DESIGN_TOKENS.spacing.md : 0,
        }}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity 
          onPress={onAction}
          style={{
            marginTop: DESIGN_TOKENS.spacing.md,
            backgroundColor: DESIGN_TOKENS.colors.primary,
            paddingVertical: DESIGN_TOKENS.spacing.sm,
            paddingHorizontal: DESIGN_TOKENS.spacing.lg,
            borderRadius: DESIGN_TOKENS.radius.button,
            ...DESIGN_TOKENS.shadows.small,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14, fontFamily: DESIGN_TOKENS.typography.fontFamily }}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }): React.JSX.Element {
  return (
    <View style={{ 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: DESIGN_TOKENS.spacing.xxl,
      backgroundColor: DESIGN_TOKENS.colors.background,
    }}>
      <View style={{
        width: 64,
        height: 64,
        borderRadius: DESIGN_TOKENS.radius.full,
        backgroundColor: DESIGN_TOKENS.colors.dangerLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: DESIGN_TOKENS.spacing.md,
      }}>
        <View style={{
          width: 28,
          height: 28,
          borderRadius: DESIGN_TOKENS.radius.full,
          backgroundColor: DESIGN_TOKENS.colors.danger,
        }} />
      </View>
      <Text style={{ 
        fontSize: 16, 
        color: DESIGN_TOKENS.colors.danger, 
        marginBottom: DESIGN_TOKENS.spacing.sm, 
        textAlign: 'center',
        fontFamily: DESIGN_TOKENS.typography.fontFamily,
        fontWeight: '600',
      }}>
        {message}
      </Text>
      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          style={{
            marginTop: DESIGN_TOKENS.spacing.sm,
            backgroundColor: DESIGN_TOKENS.colors.primary,
            paddingVertical: DESIGN_TOKENS.spacing.sm,
            paddingHorizontal: DESIGN_TOKENS.spacing.lg,
            borderRadius: DESIGN_TOKENS.radius.button,
            ...DESIGN_TOKENS.shadows.small,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14, fontFamily: DESIGN_TOKENS.typography.fontFamily }}>
            Retry
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
