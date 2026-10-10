import React from 'react';
import { Flame } from 'lucide-react';
import { DESIGN_TOKENS } from '../../tokens';
export const FireIcon = ({ size = 24, color, strokeWidth = 2, className, ...props }) => {
    const iconColor = color || DESIGN_TOKENS.colors.primary;
    return (React.createElement(Flame, { size: size, color: iconColor, strokeWidth: strokeWidth, className: className, "aria-hidden": props['aria-label'] ? undefined : true, ...props }));
};
export { FireIcon as Flame };
