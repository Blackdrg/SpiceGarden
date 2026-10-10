import React from 'react';
import { Bike } from 'lucide-react';
import { DESIGN_TOKENS } from '../../tokens';
export const DeliveryIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => { const iconColor = color || DESIGN_TOKENS.colors.primary; return (React.createElement(Bike, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props })); };
