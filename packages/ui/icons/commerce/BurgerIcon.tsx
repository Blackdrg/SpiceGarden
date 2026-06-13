import React from 'react';
import { IconProps } from '../types';
import { DESIGN_TOKENS } from '../../tokens';

export const BurgerIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={props['aria-label'] ? undefined : true} {...props}>
      <path d="M3 11h18" />
      <path d="M5 11c0-3 2-6 4-6h10c2 0 4 3 4 6" />
      <path d="M6 15v2c0 1 1 2 2 2h8c1 0 2-1 2-2v-2" />
      <circle cx="8" cy="8" r="1" fill={iconColor} />
      <circle cx="16" cy="8" r="1" fill={iconColor} />
    </svg>
  );
};
