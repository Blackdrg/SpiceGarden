"use client";
import React from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';
export const FoodCard = ({ image, title, price, rating, offerBadge, isVeg, spiceLevel, onPress, style, }) => {
    const spiceLabels = { 1: '🌶️ Mild', 2: '🌶️🌶️ Medium', 3: '🌶️🌶️🌶️ Hot' };
    return (React.createElement("div", { onClick: onPress, onKeyDown: (e) => {
            if (onPress && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onPress();
            }
        }, role: onPress ? 'button' : undefined, tabIndex: onPress ? 0 : undefined, style: {
            display: 'flex',
            gap: DESIGN_TOKENS.spacing.md,
            backgroundColor: DESIGN_TOKENS.colors.surface,
            borderRadius: DESIGN_TOKENS.radius.card,
            padding: DESIGN_TOKENS.spacing.lg,
            border: `1px solid ${DESIGN_TOKENS.colors.border}`,
            boxShadow: DESIGN_TOKENS.shadows.small,
            transition: `transform ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
            cursor: onPress ? 'pointer' : 'default',
            ...style,
        } },
        image && (React.createElement("img", { src: image, alt: title, style: {
                width: 64,
                height: 64,
                borderRadius: DESIGN_TOKENS.radius.md,
                objectFit: 'cover',
            } })),
        React.createElement("div", { style: { flex: 1 } },
            React.createElement("span", { style: {
                    ...DESIGN_TOKENS.typography.bodyMedium,
                    color: DESIGN_TOKENS.colors.textPrimary,
                    display: 'block',
                    marginBottom: 4,
                } }, title),
            React.createElement("span", { style: {
                    ...DESIGN_TOKENS.typography.headingS,
                    color: DESIGN_TOKENS.colors.primary,
                    fontWeight: 600,
                } },
                "\u20B9",
                price),
            rating && (React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 } },
                React.createElement("span", { style: { color: '#ffd700' } }, "\u2605"),
                React.createElement("span", { style: { ...DESIGN_TOKENS.typography.caption, color: DESIGN_TOKENS.colors.textSecondary } }, rating.toFixed(1)))),
            isVeg !== undefined && (React.createElement("span", { style: {
                    marginTop: 4,
                    padding: '2px 8px',
                    fontSize: 11,
                    borderRadius: 4,
                    background: isVeg ? '#e8f5e8' : '#fff5f5',
                    color: isVeg ? DESIGN_TOKENS.colors.success : DESIGN_TOKENS.colors.danger,
                } }, isVeg ? 'Veg' : 'Non-Veg')),
            spiceLevel && (React.createElement("span", { style: {
                    marginTop: 4,
                    ...DESIGN_TOKENS.typography.caption,
                    color: DESIGN_TOKENS.colors.warning,
                } }, spiceLabels[spiceLevel]))),
        offerBadge && (React.createElement("span", { style: {
                padding: '4px 8px',
                background: DESIGN_TOKENS.colors.success,
                color: 'white',
                borderRadius: DESIGN_TOKENS.radius.sm,
                fontSize: 11,
                fontWeight: 600,
            } }, offerBadge))));
};
export const MenuCard = ({ title, description, price, image, variant = 'item', onPress, }) => {
    if (variant === 'section') {
        return (React.createElement("div", { style: {
                padding: DESIGN_TOKENS.spacing.lg,
                backgroundColor: DESIGN_TOKENS.colors.surface,
                borderRadius: DESIGN_TOKENS.radius.card,
                border: `1px solid ${DESIGN_TOKENS.colors.border}`,
            } },
            React.createElement("h3", { style: {
                    margin: 0,
                    ...DESIGN_TOKENS.typography.headingM,
                    color: DESIGN_TOKENS.colors.textPrimary,
                } }, title),
            description && (React.createElement("p", { style: {
                    margin: '8px 0 0 0',
                    ...DESIGN_TOKENS.typography.body,
                    color: DESIGN_TOKENS.colors.textSecondary,
                } }, description))));
    }
    if (variant === 'combo') {
        return (React.createElement("div", { onClick: onPress, onKeyDown: (e) => {
                if (onPress && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onPress();
                }
            }, role: onPress ? 'button' : undefined, tabIndex: onPress ? 0 : undefined, style: {
                display: 'flex',
                gap: DESIGN_TOKENS.spacing.md,
                backgroundColor: '#fff8f0',
                borderRadius: DESIGN_TOKENS.radius.card,
                padding: DESIGN_TOKENS.spacing.lg,
                border: `2px dashed ${DESIGN_TOKENS.colors.primary}`,
                cursor: onPress ? 'pointer' : 'default',
            } },
            React.createElement("div", { style: { flex: 1 } },
                React.createElement("span", { style: {
                        ...DESIGN_TOKENS.typography.bodyMedium,
                        fontWeight: 600,
                        color: DESIGN_TOKENS.colors.textPrimary,
                        display: 'block',
                        marginBottom: 4,
                    } }, title),
                description && (React.createElement("span", { style: {
                        ...DESIGN_TOKENS.typography.caption,
                        color: DESIGN_TOKENS.colors.textSecondary,
                    } }, description))),
            React.createElement("span", { style: {
                    ...DESIGN_TOKENS.typography.headingS,
                    color: DESIGN_TOKENS.colors.primary,
                } },
                "\u20B9",
                price)));
    }
    // Default item variant
    return (React.createElement("div", { onClick: onPress, onKeyDown: (e) => {
            if (onPress && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onPress();
            }
        }, role: onPress ? 'button' : undefined, tabIndex: onPress ? 0 : undefined, style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: DESIGN_TOKENS.spacing.lg,
            backgroundColor: DESIGN_TOKENS.colors.surface,
            borderRadius: DESIGN_TOKENS.radius.card,
            border: `1px solid ${DESIGN_TOKENS.colors.border}`,
            cursor: onPress ? 'pointer' : 'default',
        } },
        React.createElement("div", { style: { flex: 1 } },
            React.createElement("span", { style: {
                    ...DESIGN_TOKENS.typography.bodyMedium,
                    color: DESIGN_TOKENS.colors.textPrimary,
                    display: 'block',
                } }, title),
            description && (React.createElement("span", { style: {
                    ...DESIGN_TOKENS.typography.caption,
                    color: DESIGN_TOKENS.colors.textSecondary,
                    display: 'block',
                    marginTop: 4,
                } }, description))),
        price && (React.createElement("span", { style: {
                ...DESIGN_TOKENS.typography.bodyMedium,
                color: DESIGN_TOKENS.colors.primary,
                fontWeight: 600,
            } },
            "\u20B9",
            price))));
};
export const MapCard = ({ eta, riderName, riderAvatar, progress = 0 }) => {
    const progressColor = progress < 30 ? DESIGN_TOKENS.colors.primary :
        progress < 70 ? DESIGN_TOKENS.colors.warning : DESIGN_TOKENS.colors.success;
    return (React.createElement("div", { style: {
            backgroundColor: DESIGN_TOKENS.colors.surface,
            borderRadius: DESIGN_TOKENS.radius.card,
            padding: DESIGN_TOKENS.spacing.lg,
            border: `1px solid ${DESIGN_TOKENS.colors.border}`,
            boxShadow: DESIGN_TOKENS.shadows.medium,
        } },
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing.md, marginBottom: DESIGN_TOKENS.spacing.md } },
            riderAvatar && (React.createElement("img", { src: riderAvatar, alt: riderName || 'Rider', style: {
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                } })),
            React.createElement("div", { style: { flex: 1 } },
                React.createElement("span", { style: {
                        ...DESIGN_TOKENS.typography.bodyMedium,
                        color: DESIGN_TOKENS.colors.textPrimary,
                        display: 'block',
                    } }, riderName || 'Driver'),
                React.createElement("span", { style: {
                        ...DESIGN_TOKENS.typography.caption,
                        color: DESIGN_TOKENS.colors.textSecondary,
                    } }, "On the way")),
            React.createElement("span", { style: {
                    padding: '6px 12px',
                    background: '#f0f8ff',
                    color: DESIGN_TOKENS.colors.primary,
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 600,
                } },
                "ETA: ",
                eta,
                " min")),
        React.createElement("div", { style: { height: 6, borderRadius: 3, backgroundColor: '#eee', overflow: 'hidden' } },
            React.createElement("div", { style: {
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: progressColor,
                    transition: 'width 0.3s ease',
                } }))));
};
export const TrackingCard = ({ status, eta, address, onContact, onSupport }) => {
    const statusLabels = {
        preparing: 'Preparing your order',
        'picked-up': 'Picked up for delivery',
        'on-the-way': 'On the way',
        delivered: 'Delivered',
    };
    const statusColors = {
        preparing: DESIGN_TOKENS.colors.warning,
        'picked-up': DESIGN_TOKENS.colors.primary,
        'on-the-way': DESIGN_TOKENS.colors.success,
        delivered: DESIGN_TOKENS.colors.success,
    };
    return (React.createElement("div", { style: {
            backgroundColor: DESIGN_TOKENS.colors.surface,
            borderRadius: DESIGN_TOKENS.radius.card,
            padding: DESIGN_TOKENS.spacing.lg,
            border: `1px solid ${DESIGN_TOKENS.colors.border}`,
            boxShadow: DESIGN_TOKENS.shadows.small,
        } },
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing.md } },
            React.createElement("div", { style: {
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: statusColors[status],
                } }),
            React.createElement("span", { style: {
                    ...DESIGN_TOKENS.typography.bodyMedium,
                    color: DESIGN_TOKENS.colors.textPrimary,
                    flex: 1,
                } }, statusLabels[status]),
            eta && (React.createElement("span", { style: {
                    ...DESIGN_TOKENS.typography.bodyMedium,
                    color: DESIGN_TOKENS.colors.primary,
                    fontWeight: 600,
                } },
                eta,
                " min"))),
        address && (React.createElement("p", { style: {
                margin: '12px 0 0 0',
                ...DESIGN_TOKENS.typography.caption,
                color: DESIGN_TOKENS.colors.textSecondary,
            } }, address)),
        (onContact || onSupport) && (React.createElement("div", { style: { display: 'flex', gap: DESIGN_TOKENS.spacing.sm, marginTop: DESIGN_TOKENS.spacing.md } },
            onContact && (React.createElement("button", { onClick: onContact, style: {
                    flex: 1,
                    padding: '8px 16px',
                    border: `1px solid ${DESIGN_TOKENS.colors.primary}`,
                    borderRadius: DESIGN_TOKENS.radius.button,
                    background: 'transparent',
                    color: DESIGN_TOKENS.colors.primary,
                    ...DESIGN_TOKENS.typography.bodyMedium,
                    cursor: 'pointer',
                } }, "Contact Driver")),
            onSupport && (React.createElement("button", { onClick: onSupport, style: {
                    flex: 1,
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: DESIGN_TOKENS.radius.button,
                    background: DESIGN_TOKENS.colors.elevated,
                    color: DESIGN_TOKENS.colors.textPrimary,
                    ...DESIGN_TOKENS.typography.bodyMedium,
                    cursor: 'pointer',
                } }, "Support"))))));
};
export const ReviewCard = ({ orderId, onSubmit }) => {
    const [rating, setRating] = React.useState(0);
    const [review, setReview] = React.useState('');
    return (React.createElement("div", { style: {
            backgroundColor: DESIGN_TOKENS.colors.surface,
            borderRadius: DESIGN_TOKENS.radius.card,
            padding: DESIGN_TOKENS.spacing.lg,
            border: `1px solid ${DESIGN_TOKENS.colors.border}`,
        } },
        React.createElement("h3", { style: {
                margin: '0 0 16px 0',
                ...DESIGN_TOKENS.typography.headingS,
                color: DESIGN_TOKENS.colors.textPrimary,
            } }, "Rate Your Order"),
        React.createElement("div", { style: { display: 'flex', gap: 8, marginBottom: DESIGN_TOKENS.spacing.lg } }, [1, 2, 3, 4, 5].map((star) => (React.createElement("button", { key: star, onClick: () => setRating(star), "aria-label": `Rate ${star} star${star > 1 ? 's' : ''}`, style: {
                fontSize: 32,
                color: star <= rating ? '#ffd700' : DESIGN_TOKENS.colors.border,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
            } }, "\u2605")))),
        React.createElement("label", { htmlFor: "rating-card-review", style: {
                display: 'block',
                marginBottom: DESIGN_TOKENS.spacing.xs,
                ...DESIGN_TOKENS.typography.smallLabel,
                color: DESIGN_TOKENS.colors.textPrimary,
            } }, "Write a review (optional)"),
        React.createElement("textarea", { id: "rating-card-review", placeholder: "Share details of your experience...", value: review, onChange: (e) => setReview(e.target.value), style: {
                width: '100%',
                minHeight: 100,
                padding: DESIGN_TOKENS.spacing.md,
                borderRadius: DESIGN_TOKENS.radius.input,
                border: `1px solid ${DESIGN_TOKENS.colors.border}`,
                ...DESIGN_TOKENS.typography.body,
                fontFamily: DESIGN_TOKENS.typography.fontFamily,
                resize: 'vertical',
                marginBottom: DESIGN_TOKENS.spacing.md,
            } }),
        React.createElement("button", { onClick: () => onSubmit?.(rating, review), disabled: rating === 0, style: {
                width: '100%',
                padding: '12px 24px',
                border: 'none',
                borderRadius: DESIGN_TOKENS.radius.button,
                background: rating > 0 ? DESIGN_TOKENS.colors.primary : DESIGN_TOKENS.colors.border,
                color: 'white',
                ...DESIGN_TOKENS.typography.bodyMedium,
                cursor: rating > 0 ? 'pointer' : 'not-allowed',
            } }, "Submit Review")));
};
