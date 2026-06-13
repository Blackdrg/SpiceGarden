import React from 'react';
import { IconProps } from '../types';
import { DESIGN_TOKENS } from '../../tokens';

export const PizzaIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={props['aria-label'] ? undefined : true} {...props}>
      <path d="M12 2L2 21h20L12 2z" fill={color ? iconColor + '20' : DESIGN_TOKENS.colors.primary + '20'} stroke={iconColor} />
      <circle cx="9" cy="14" r="1.5" fill={iconColor} />
      <circle cx="15" cy="12" r="1" fill={iconColor} />
      <circle cx="12" cy="16" r="1" fill={iconColor} />
    </svg>
  );
};
