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

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    opacity: 0.6,
  },
});

export default SkeletonRect;
