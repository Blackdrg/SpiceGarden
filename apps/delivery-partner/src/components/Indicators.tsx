import React from 'react';
import { ActivityIndicator, Text, View, TouchableOpacity } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';

export function LoadingSpinner({ label }: { label?: string }): React.JSX.Element {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
      {label ? <Text style={{ marginTop: 12, color: DESIGN_TOKENS.colors.textSecondary }}>{label}</Text> : null}

    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message?: string }): React.JSX.Element {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: DESIGN_TOKENS.colors.textPrimary, marginBottom: 8 }}>{title}</Text>
      {message ? (
        <Text style={{ textAlign: 'center', color: DESIGN_TOKENS.colors.textSecondary }}>{message}</Text>
      ) : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }): React.JSX.Element {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 16, color: DESIGN_TOKENS.colors.danger, marginBottom: 12, textAlign: 'center' }}>
        {message}
      </Text>
      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: DESIGN_TOKENS.colors.primary, borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
