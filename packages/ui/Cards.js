"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewCard = exports.TrackingCard = exports.MapCard = exports.MenuCard = exports.FoodCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const tokens_1 = require("./tokens");
const FoodCard = ({ image, title, price, rating, offerBadge, isVeg, spiceLevel, onPress, style, }) => {
    const spiceLabels = { 1: '🌶️ Mild', 2: '🌶️🌶️ Medium', 3: '🌶️🌶️🌶️ Hot' };
    return ((0, jsx_runtime_1.jsxs)("div", { onClick: onPress, role: onPress ? 'button' : undefined, tabIndex: onPress ? 0 : undefined, style: {
            display: 'flex',
            gap: tokens_1.DESIGN_TOKENS.spacing.md,
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
            borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
            padding: tokens_1.DESIGN_TOKENS.spacing.lg,
            border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
            boxShadow: tokens_1.DESIGN_TOKENS.shadows.small,
            transition: `transform ${tokens_1.DESIGN_TOKENS.motion.micro}ms ${tokens_1.MOTION_EASING.easeOutSoft}`,
            cursor: onPress ? 'pointer' : 'default',
            ...style,
        }, children: [image && ((0, jsx_runtime_1.jsx)("img", { src: image, alt: title, style: {
                    width: 64,
                    height: 64,
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.md,
                    objectFit: 'cover',
                } })), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                            ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                            color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                            display: 'block',
                            marginBottom: 4,
                        }, children: title }), (0, jsx_runtime_1.jsxs)("span", { style: {
                            ...tokens_1.DESIGN_TOKENS.typography.headingS,
                            color: tokens_1.DESIGN_TOKENS.colors.primary,
                            fontWeight: 600,
                        }, children: ["\u20B9", price] }), rating && ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: '#ffd700' }, children: "\u2605" }), (0, jsx_runtime_1.jsx)("span", { style: { ...tokens_1.DESIGN_TOKENS.typography.caption, color: tokens_1.DESIGN_TOKENS.colors.textSecondary }, children: rating.toFixed(1) })] })), isVeg !== undefined && ((0, jsx_runtime_1.jsx)("span", { style: {
                            marginTop: 4,
                            padding: '2px 8px',
                            fontSize: 11,
                            borderRadius: 4,
                            background: isVeg ? '#e8f5e8' : '#fff5f5',
                            color: isVeg ? tokens_1.DESIGN_TOKENS.colors.success : tokens_1.DESIGN_TOKENS.colors.danger,
                        }, children: isVeg ? 'Veg' : 'Non-Veg' })), spiceLevel && ((0, jsx_runtime_1.jsx)("span", { style: {
                            marginTop: 4,
                            ...tokens_1.DESIGN_TOKENS.typography.caption,
                            color: tokens_1.DESIGN_TOKENS.colors.warning,
                        }, children: spiceLabels[spiceLevel] }))] }), offerBadge && ((0, jsx_runtime_1.jsx)("span", { style: {
                    padding: '4px 8px',
                    background: tokens_1.DESIGN_TOKENS.colors.success,
                    color: 'white',
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.sm,
                    fontSize: 11,
                    fontWeight: 600,
                }, children: offerBadge }))] }));
};
exports.FoodCard = FoodCard;
const MenuCard = ({ title, description, price, image, variant = 'item', onPress, }) => {
    if (variant === 'section') {
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                padding: tokens_1.DESIGN_TOKENS.spacing.lg,
                backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
                borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
                border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
            }, children: [(0, jsx_runtime_1.jsx)("h3", { style: {
                        margin: 0,
                        ...tokens_1.DESIGN_TOKENS.typography.headingM,
                        color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    }, children: title }), description && ((0, jsx_runtime_1.jsx)("p", { style: {
                        margin: '8px 0 0 0',
                        ...tokens_1.DESIGN_TOKENS.typography.body,
                        color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                    }, children: description }))] }));
    }
    if (variant === 'combo') {
        return ((0, jsx_runtime_1.jsxs)("div", { onClick: onPress, role: onPress ? 'button' : undefined, style: {
                display: 'flex',
                gap: tokens_1.DESIGN_TOKENS.spacing.md,
                backgroundColor: '#fff8f0',
                borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
                padding: tokens_1.DESIGN_TOKENS.spacing.lg,
                border: `2px dashed ${tokens_1.DESIGN_TOKENS.colors.primary}`,
                cursor: onPress ? 'pointer' : 'default',
            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                                ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                                fontWeight: 600,
                                color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                                display: 'block',
                                marginBottom: 4,
                            }, children: title }), description && ((0, jsx_runtime_1.jsx)("span", { style: {
                                ...tokens_1.DESIGN_TOKENS.typography.caption,
                                color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                            }, children: description }))] }), (0, jsx_runtime_1.jsxs)("span", { style: {
                        ...tokens_1.DESIGN_TOKENS.typography.headingS,
                        color: tokens_1.DESIGN_TOKENS.colors.primary,
                    }, children: ["\u20B9", price] })] }));
    }
    // Default item variant
    return ((0, jsx_runtime_1.jsxs)("div", { onClick: onPress, role: onPress ? 'button' : undefined, style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: tokens_1.DESIGN_TOKENS.spacing.lg,
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
            borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
            border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
            cursor: onPress ? 'pointer' : 'default',
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                            ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                            color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                            display: 'block',
                        }, children: title }), description && ((0, jsx_runtime_1.jsx)("span", { style: {
                            ...tokens_1.DESIGN_TOKENS.typography.caption,
                            color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                            display: 'block',
                            marginTop: 4,
                        }, children: description }))] }), price && ((0, jsx_runtime_1.jsxs)("span", { style: {
                    ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                    color: tokens_1.DESIGN_TOKENS.colors.primary,
                    fontWeight: 600,
                }, children: ["\u20B9", price] }))] }));
};
exports.MenuCard = MenuCard;
const MapCard = ({ eta, riderName, riderAvatar, progress = 0 }) => {
    const progressColor = progress < 30 ? tokens_1.DESIGN_TOKENS.colors.primary :
        progress < 70 ? tokens_1.DESIGN_TOKENS.colors.warning : tokens_1.DESIGN_TOKENS.colors.success;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
            borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
            padding: tokens_1.DESIGN_TOKENS.spacing.lg,
            border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
            boxShadow: tokens_1.DESIGN_TOKENS.shadows.medium,
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: tokens_1.DESIGN_TOKENS.spacing.md, marginBottom: tokens_1.DESIGN_TOKENS.spacing.md }, children: [riderAvatar && ((0, jsx_runtime_1.jsx)("img", { src: riderAvatar, alt: riderName || 'Rider', style: {
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                        } })), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                                    ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                                    display: 'block',
                                }, children: riderName || 'Driver' }), (0, jsx_runtime_1.jsx)("span", { style: {
                                    ...tokens_1.DESIGN_TOKENS.typography.caption,
                                    color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                                }, children: "On the way" })] }), (0, jsx_runtime_1.jsxs)("span", { style: {
                            padding: '6px 12px',
                            background: '#f0f8ff',
                            color: tokens_1.DESIGN_TOKENS.colors.primary,
                            borderRadius: 999,
                            fontSize: 14,
                            fontWeight: 600,
                        }, children: ["ETA: ", eta, " min"] })] }), (0, jsx_runtime_1.jsx)("div", { style: { height: 6, borderRadius: 3, backgroundColor: '#eee', overflow: 'hidden' }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                        height: '100%',
                        width: `${progress}%`,
                        backgroundColor: progressColor,
                        transition: 'width 0.3s ease',
                    } }) })] }));
};
exports.MapCard = MapCard;
const TrackingCard = ({ status, eta, address, onContact, onSupport }) => {
    const statusLabels = {
        preparing: 'Preparing your order',
        'picked-up': 'Picked up for delivery',
        'on-the-way': 'On the way',
        delivered: 'Delivered',
    };
    const statusColors = {
        preparing: tokens_1.DESIGN_TOKENS.colors.warning,
        'picked-up': tokens_1.DESIGN_TOKENS.colors.primary,
        'on-the-way': tokens_1.DESIGN_TOKENS.colors.success,
        delivered: tokens_1.DESIGN_TOKENS.colors.success,
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
            borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
            padding: tokens_1.DESIGN_TOKENS.spacing.lg,
            border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
            boxShadow: tokens_1.DESIGN_TOKENS.shadows.small,
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: tokens_1.DESIGN_TOKENS.spacing.md }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: statusColors[status],
                        } }), (0, jsx_runtime_1.jsx)("span", { style: {
                            ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                            color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                            flex: 1,
                        }, children: statusLabels[status] }), eta && ((0, jsx_runtime_1.jsxs)("span", { style: {
                            ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                            color: tokens_1.DESIGN_TOKENS.colors.primary,
                            fontWeight: 600,
                        }, children: [eta, " min"] }))] }), address && ((0, jsx_runtime_1.jsx)("p", { style: {
                    margin: '12px 0 0 0',
                    ...tokens_1.DESIGN_TOKENS.typography.caption,
                    color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                }, children: address })), (onContact || onSupport) && ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing.sm, marginTop: tokens_1.DESIGN_TOKENS.spacing.md }, children: [onContact && ((0, jsx_runtime_1.jsx)("button", { onClick: onContact, style: {
                            flex: 1,
                            padding: '8px 16px',
                            border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.primary}`,
                            borderRadius: tokens_1.DESIGN_TOKENS.radius.button,
                            background: 'transparent',
                            color: tokens_1.DESIGN_TOKENS.colors.primary,
                            ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                            cursor: 'pointer',
                        }, children: "Contact Driver" })), onSupport && ((0, jsx_runtime_1.jsx)("button", { onClick: onSupport, style: {
                            flex: 1,
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: tokens_1.DESIGN_TOKENS.radius.button,
                            background: tokens_1.DESIGN_TOKENS.colors.elevated,
                            color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                            ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                            cursor: 'pointer',
                        }, children: "Support" }))] }))] }));
};
exports.TrackingCard = TrackingCard;
const ReviewCard = ({ orderId, onSubmit }) => {
    const [rating, setRating] = react_1.default.useState(0);
    const [review, setReview] = react_1.default.useState('');
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
            borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
            padding: tokens_1.DESIGN_TOKENS.spacing.lg,
            border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
        }, children: [(0, jsx_runtime_1.jsx)("h3", { style: {
                    margin: '0 0 16px 0',
                    ...tokens_1.DESIGN_TOKENS.typography.headingS,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                }, children: "Rate Your Order" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', gap: 8, marginBottom: tokens_1.DESIGN_TOKENS.spacing.lg }, children: [1, 2, 3, 4, 5].map((star) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => setRating(star), "aria-label": `Rate ${star} star${star > 1 ? 's' : ''}`, style: {
                        fontSize: 32,
                        color: star <= rating ? '#ffd700' : tokens_1.DESIGN_TOKENS.colors.border,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                    }, children: "\u2605" }, star))) }), (0, jsx_runtime_1.jsx)("textarea", { placeholder: "Your review...", value: review, onChange: (e) => setReview(e.target.value), style: {
                    width: '100%',
                    minHeight: 100,
                    padding: tokens_1.DESIGN_TOKENS.spacing.md,
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.input,
                    border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
                    ...tokens_1.DESIGN_TOKENS.typography.body,
                    fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
                    resize: 'vertical',
                    marginBottom: tokens_1.DESIGN_TOKENS.spacing.md,
                } }), (0, jsx_runtime_1.jsx)("button", { onClick: () => onSubmit?.(rating, review), disabled: rating === 0, style: {
                    width: '100%',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.button,
                    background: rating > 0 ? tokens_1.DESIGN_TOKENS.colors.primary : tokens_1.DESIGN_TOKENS.colors.border,
                    color: 'white',
                    ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                    cursor: rating > 0 ? 'pointer' : 'not-allowed',
                }, children: "Submit Review" })] }));
};
exports.ReviewCard = ReviewCard;
