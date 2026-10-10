import React from 'react';
import { Package } from 'lucide-react';
import { DESIGN_TOKENS } from '../../tokens';
export const OrderIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => { const iconColor = color || DESIGN_TOKENS.colors.primary; return (React.createElement(Package, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props })); };
