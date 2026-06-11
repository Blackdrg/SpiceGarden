import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
};

export const SkeletonRect = ({ width = '100%', height = 16, borderRadius = 4, style }: SkeletonProps) => (
  <View style={[styles.skeleton, { width, height, borderRadius }, style]} />
);

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <View style={styles.textStack}>
    {Array.from({ length: lines }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.skeleton,
          styles.textLine,
          i === lines - 1 ? { width: '60%' } : {},
        ]}
      />
    ))}
  </View>
);

export const SkeletonCircle = ({ size = 40 }: { size?: number }) => (
  <View style={[styles.skeleton, { width: size, height: size, borderRadius: size / 2 }]} />
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    opacity: 0.6,
  },
  textStack: {
    gap: 8,
  },
  textLine: {
    height: 12,
    borderRadius: 4,
  },
});

export default SkeletonRect;
