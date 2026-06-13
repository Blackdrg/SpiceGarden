import React from 'react';
import { IconProps } from '../types';
import { DESIGN_TOKENS } from '../../tokens';

export const HealthyIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={props['aria-label'] ? undefined : true} {...props}>
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 8v4l2 2" />
    </svg>
  );
};
