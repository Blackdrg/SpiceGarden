"use client";

import React from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'elevated' | 'list' | 'interactive';
  style?: React.CSSProperties;
  isElevated?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card = ({ children, title, subtitle, variant = 'default', style, isElevated, onClick, padding = 'md', className }: CardProps) => {
  const getVariantStyles = () => {
    if (isElevated || variant === 'elevated') {
      return {
        boxShadow: DESIGN_TOKENS.shadows.medium,
        border: `1px solid ${DESIGN_TOKENS.colors.border}`,
      };
    }
    if (variant === 'interactive') {
      return {
        boxShadow: DESIGN_TOKENS.shadows.xs,
        border: `1px solid ${DESIGN_TOKENS.colors.borderLight}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: `all ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
      };
    }
    if (variant === 'list') {
      return {
        boxShadow: DESIGN_TOKENS.shadows.none,
        borderBottom: `1px solid ${DESIGN_TOKENS.colors.divider}`,
        borderRadius: 0,
      };
    }
    return {
      boxShadow: DESIGN_TOKENS.shadows.xs,
      border: `1px solid ${DESIGN_TOKENS.colors.borderLight}`,
    };
  };

  const getPadding = () => {
    switch (padding) {
      case 'none': return 0;
      case 'sm': return DESIGN_TOKENS.spacing[3];
      case 'lg': return DESIGN_TOKENS.spacing[6];
      default: return DESIGN_TOKENS.spacing[5];
    }
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: variant === 'list' ? 0 : `${DESIGN_TOKENS.radius.xl}px`,
    padding: getPadding(),
    margin: `${DESIGN_TOKENS.spacing[3]}px 0`,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    transition: variant === 'interactive' ? `all ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}` : undefined,
    ...getVariantStyles(),
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (variant === 'interactive') {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = DESIGN_TOKENS.shadows.medium;
      e.currentTarget.style.borderColor = DESIGN_TOKENS.colors.border;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (variant === 'interactive') {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = DESIGN_TOKENS.shadows.xs;
      e.currentTarget.style.borderColor = DESIGN_TOKENS.colors.borderLight;
    }
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      {(title || subtitle) && (
        <div style={{ marginBottom: DESIGN_TOKENS.spacing[4] }}>
          {title && (
            <h3 style={{
              margin: 0,
              marginBottom: subtitle ? DESIGN_TOKENS.spacing[1] : 0,
              ...DESIGN_TOKENS.typography.headingS,
              color: DESIGN_TOKENS.colors.textPrimary,
            }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{
              margin: 0,
              ...DESIGN_TOKENS.typography.bodySmall,
              color: DESIGN_TOKENS.colors.textSecondary,
            }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div style={{ ...DESIGN_TOKENS.typography.body }}>
        {children}
      </div>
    </div>
  );
};

Card.displayName = 'Card';
