import React from 'react';
import { Star } from 'lucide-react';
import { DESIGN_TOKENS } from '../../tokens';
export const RatingIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => { const iconColor = color || DESIGN_TOKENS.colors.primary; return (React.createElement(Star, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, fill: props.fill || 'none', ...props })); };
