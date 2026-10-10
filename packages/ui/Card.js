"use client";
import React from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';
export const Card = ({ children, title, variant = 'default', style, isElevated }) => {
    const getVariantStyles = () => {
        if (isElevated) {
            return {
                boxShadow: DESIGN_TOKENS.shadows.large,
                transform: 'translateY(0)',
            };
        }
        switch (variant) {
            case 'elevated':
                return {
                    boxShadow: DESIGN_TOKENS.shadows.large,
                    transform: 'translateY(0)',
                };
            case 'list':
                return {
                    boxShadow: DESIGN_TOKENS.shadows.small,
                };
            default:
                return {
                    boxShadow: DESIGN_TOKENS.shadows.small,
                };
        }
    };
    return (React.createElement("div", { style: {
            border: `1px solid ${DESIGN_TOKENS.colors.border}`,
            borderRadius: `${DESIGN_TOKENS.radius.card}px`,
            padding: `${DESIGN_TOKENS.spacing.lg}px`,
            margin: `${DESIGN_TOKENS.spacing.md}px 0`,
            backgroundColor: DESIGN_TOKENS.colors.surface,
            transition: `all ${DESIGN_TOKENS.motion.standard}ms ${MOTION_EASING.easeInOut}`,
            fontFamily: DESIGN_TOKENS.typography.fontFamily,
            ...getVariantStyles(),
            ...style,
        } },
        title && (React.createElement("h3", { style: {
                marginTop: 0,
                marginBottom: DESIGN_TOKENS.spacing.md,
                ...DESIGN_TOKENS.typography.headingS,
                color: DESIGN_TOKENS.colors.textPrimary
            } }, title)),
        React.createElement("div", { style: { ...DESIGN_TOKENS.typography.body } }, children)));
};
