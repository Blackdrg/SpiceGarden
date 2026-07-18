import React from 'react';
import { DESIGN_TOKENS } from '@spicegarden/ui';

export const legalPageContainer: React.CSSProperties = {
  maxWidth: 900,
  margin: '0 auto',
  padding: DESIGN_TOKENS.spacing.lg,
  fontFamily: DESIGN_TOKENS.typography.fontFamily,
  backgroundColor: DESIGN_TOKENS.colors.background,
  minHeight: '100vh',
  color: DESIGN_TOKENS.colors.textPrimary,
};

export const legalTitle: React.CSSProperties = {
  ...DESIGN_TOKENS.typography.headingL,
  color: DESIGN_TOKENS.colors.textPrimary,
  marginBottom: DESIGN_TOKENS.spacing.sm,
};

export const legalMeta: React.CSSProperties = {
  color: DESIGN_TOKENS.colors.textSecondary,
  fontSize: 14,
  marginBottom: DESIGN_TOKENS.spacing.lg,
};

export const legalSectionHeading: React.CSSProperties = {
  ...DESIGN_TOKENS.typography.headingS,
  color: DESIGN_TOKENS.colors.textPrimary,
  marginTop: DESIGN_TOKENS.spacing.lg,
  marginBottom: DESIGN_TOKENS.spacing.xs,
};
