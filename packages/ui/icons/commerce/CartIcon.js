import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { DESIGN_TOKENS } from '../../tokens';
export const CartIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => { const iconColor = color || DESIGN_TOKENS.colors.primary; return (React.createElement(ShoppingCart, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props })); };
