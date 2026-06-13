import React from 'react';
import { IconProps } from '../types';
import { DESIGN_TOKENS } from '../../tokens';

export const DrinkIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={props['aria-label'] ? undefined : true} {...props}>
      <path d="M6 2h12l-1 8c0 2-1 4-4 4s-4-2-4-4L6 2z" />
      <path d="M5 10h14" />
      <path d="M10 15v4" />
      <path d="M14 15v4" />
    </svg>
  );
};
