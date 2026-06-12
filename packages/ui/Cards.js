"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewCard = exports.TrackingCard = exports.MapCard = exports.MenuCard = exports.FoodCard = void 0;
const react_1 = __importDefault(require("react"));
const tokens_1 = require("./tokens");
const FoodCard = ({ image, title, price, rating, offerBadge, isVeg, spiceLevel, onPress, style, }) => {
    const spiceLabels = { 1: '🌶️ Mild', 2: '🌶️🌶️ Medium', 3: '🌶️🌶️🌶️ Hot' };
    return (react_1.default.createElement("div", { onClick: onPress, role: onPress ? 'button' : undefined, tabIndex: onPress ? 0 : undefined, style: {
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
        } },
        image && (react_1.default.createElement("img", { src: image, alt: title, style: {
                width: 64,
                height: 64,
                borderRadius: tokens_1.DESIGN_TOKENS.radius.md,
                objectFit: 'cover',
            } })),
        react_1.default.createElement("div", { style: { flex: 1 } },
            react_1.default.createElement("span", { style: {
                    ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    display: 'block',
                    marginBottom: 4,
                } }, title),
            react_1.default.createElement("span", { style: {
                    ...tokens_1.DESIGN_TOKENS.typography.headingS,
                    color: tokens_1.DESIGN_TOKENS.colors.primary,
                    fontWeight: 600,
                } },
                "\u20B9",
                price),
            rating && (react_1.default.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 } },
                react_1.default.createElement("span", { style: { color: '#ffd700' } }, "\u2605"),
                react_1.default.createElement("span", { style: { ...tokens_1.DESIGN_TOKENS.typography.caption, color: tokens_1.DESIGN_TOKENS.colors.textSecondary } }, rating.toFixed(1)))),
            isVeg !== undefined && (react_1.default.createElement("span", { style: {
                    marginTop: 4,
                    padding: '2px 8px',
                    fontSize: 11,
                    borderRadius: 4,
                    background: isVeg ? '#e8f5e8' : '#fff5f5',
                    color: isVeg ? tokens_1.DESIGN_TOKENS.colors.success : tokens_1.DESIGN_TOKENS.colors.danger,
                } }, isVeg ? 'Veg' : 'Non-Veg')),
            spiceLevel && (react_1.default.createElement("span", { style: {
                    marginTop: 4,
                    ...tokens_1.DESIGN_TOKENS.typography.caption,
                    color: tokens_1.DESIGN_TOKENS.colors.warning,
                } }, spiceLabels[spiceLevel]))),
        offerBadge && (react_1.default.createElement("span", { style: {
                padding: '4px 8px',
                background: tokens_1.DESIGN_TOKENS.colors.success,
                color: 'white',
                borderRadius: tokens_1.DESIGN_TOKENS.radius.sm,
                fontSize: 11,
                fontWeight: 600,
            } }, offerBadge))));
};
exports.FoodCard = FoodCard;
const MenuCard = ({ title, description, price, image, variant = 'item', onPress, }) => {
    if (variant === 'section') {
        return (react_1.default.createElement("div", { style: {
                padding: tokens_1.DESIGN_TOKENS.spacing.lg,
                backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
                borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
                border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
            } },
            react_1.default.createElement("h3", { style: {
                    margin: 0,
                    ...tokens_1.DESIGN_TOKENS.typography.headingM,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                } }, title),
            description && (react_1.default.createElement("p", { style: {
                    margin: '8px 0 0 0',
                    ...tokens_1.DESIGN_TOKENS.typography.body,
                    color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                } }, description))));
    }
    if (variant === 'combo') {
        return (react_1.default.createElement("div", { onClick: onPress, role: onPress ? 'button' : undefined, style: {
                display: 'flex',
                gap: tokens_1.DESIGN_TOKENS.spacing.md,
                backgroundColor: '#fff8f0',
                borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
                padding: tokens_1.DESIGN_TOKENS.spacing.lg,
                border: `2px dashed ${tokens_1.DESIGN_TOKENS.colors.primary}`,
                cursor: onPress ? 'pointer' : 'default',
            } },
            react_1.default.createElement("div", { style: { flex: 1 } },
                react_1.default.createElement("span", { style: {
                        ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                        fontWeight: 600,
                        color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                        display: 'block',
                        marginBottom: 4,
                    } }, title),
                description && (react_1.default.createElement("span", { style: {
                        ...tokens_1.DESIGN_TOKENS.typography.caption,
                        color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                    } }, description))),
            react_1.default.createElement("span", { style: {
                    ...tokens_1.DESIGN_TOKENS.typography.headingS,
                    color: tokens_1.DESIGN_TOKENS.colors.primary,
                } },
                "\u20B9",
                price)));
    }
    // Default item variant
    return (react_1.default.createElement("div", { onClick: onPress, role: onPress ? 'button' : undefined, style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: tokens_1.DESIGN_TOKENS.spacing.lg,
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
            borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
            border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
            cursor: onPress ? 'pointer' : 'default',
        } },
        react_1.default.createElement("div", { style: { flex: 1 } },
            react_1.default.createElement("span", { style: {
                    ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    display: 'block',
                } }, title),
            description && (react_1.default.createElement("span", { style: {
                    ...tokens_1.DESIGN_TOKENS.typography.caption,
                    color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                    display: 'block',
                    marginTop: 4,
                } }, description))),
        price && (react_1.default.createElement("span", { style: {
                ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                color: tokens_1.DESIGN_TOKENS.colors.primary,
                fontWeight: 600,
            } },
            "\u20B9",
            price))));
};
exports.MenuCard = MenuCard;
const MapCard = ({ eta, riderName, riderAvatar, progress = 0 }) => {
    const progressColor = progress < 30 ? tokens_1.DESIGN_TOKENS.colors.primary :
        progress < 70 ? tokens_1.DESIGN_TOKENS.colors.warning : tokens_1.DESIGN_TOKENS.colors.success;
    return (react_1.default.createElement("div", { style: {
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
            borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
            padding: tokens_1.DESIGN_TOKENS.spacing.lg,
            border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
            boxShadow: tokens_1.DESIGN_TOKENS.shadows.medium,
        } },
        react_1.default.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: tokens_1.DESIGN_TOKENS.spacing.md, marginBottom: tokens_1.DESIGN_TOKENS.spacing.md } },
            riderAvatar && (react_1.default.createElement("img", { src: riderAvatar, alt: riderName || 'Rider', style: {
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                } })),
            react_1.default.createElement("div", { style: { flex: 1 } },
                react_1.default.createElement("span", { style: {
                        ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                        color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                        display: 'block',
                    } }, riderName || 'Driver'),
                react_1.default.createElement("span", { style: {
                        ...tokens_1.DESIGN_TOKENS.typography.caption,
                        color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                    } }, "On the way")),
            react_1.default.createElement("span", { style: {
                    padding: '6px 12px',
                    background: '#f0f8ff',
                    color: tokens_1.DESIGN_TOKENS.colors.primary,
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 600,
                } },
                "ETA: ",
                eta,
                " min")),
        react_1.default.createElement("div", { style: { height: 6, borderRadius: 3, backgroundColor: '#eee', overflow: 'hidden' } },
            react_1.default.createElement("div", { style: {
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: progressColor,
                    transition: 'width 0.3s ease',
                } }))));
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
    return (react_1.default.createElement("div", { style: {
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
            borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
            padding: tokens_1.DESIGN_TOKENS.spacing.lg,
            border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
            boxShadow: tokens_1.DESIGN_TOKENS.shadows.small,
        } },
        react_1.default.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: tokens_1.DESIGN_TOKENS.spacing.md } },
            react_1.default.createElement("div", { style: {
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: statusColors[status],
                } }),
            react_1.default.createElement("span", { style: {
                    ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    flex: 1,
                } }, statusLabels[status]),
            eta && (react_1.default.createElement("span", { style: {
                    ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                    color: tokens_1.DESIGN_TOKENS.colors.primary,
                    fontWeight: 600,
                } },
                eta,
                " min"))),
        address && (react_1.default.createElement("p", { style: {
                margin: '12px 0 0 0',
                ...tokens_1.DESIGN_TOKENS.typography.caption,
                color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
            } }, address)),
        (onContact || onSupport) && (react_1.default.createElement("div", { style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing.sm, marginTop: tokens_1.DESIGN_TOKENS.spacing.md } },
            onContact && (react_1.default.createElement("button", { onClick: onContact, style: {
                    flex: 1,
                    padding: '8px 16px',
                    border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.primary}`,
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.button,
                    background: 'transparent',
                    color: tokens_1.DESIGN_TOKENS.colors.primary,
                    ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                    cursor: 'pointer',
                } }, "Contact Driver")),
            onSupport && (react_1.default.createElement("button", { onClick: onSupport, style: {
                    flex: 1,
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.button,
                    background: tokens_1.DESIGN_TOKENS.colors.elevated,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                    cursor: 'pointer',
                } }, "Support"))))));
};
exports.TrackingCard = TrackingCard;
const ReviewCard = ({ orderId, onSubmit }) => {
    const [rating, setRating] = react_1.default.useState(0);
    const [review, setReview] = react_1.default.useState('');
    return (react_1.default.createElement("div", { style: {
            backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
            borderRadius: tokens_1.DESIGN_TOKENS.radius.card,
            padding: tokens_1.DESIGN_TOKENS.spacing.lg,
            border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
        } },
        react_1.default.createElement("h3", { style: {
                margin: '0 0 16px 0',
                ...tokens_1.DESIGN_TOKENS.typography.headingS,
                color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
            } }, "Rate Your Order"),
        react_1.default.createElement("div", { style: { display: 'flex', gap: 8, marginBottom: tokens_1.DESIGN_TOKENS.spacing.lg } }, [1, 2, 3, 4, 5].map((star) => (react_1.default.createElement("button", { key: star, onClick: () => setRating(star), "aria-label": `Rate ${star} star${star > 1 ? 's' : ''}`, style: {
                fontSize: 32,
                color: star <= rating ? '#ffd700' : tokens_1.DESIGN_TOKENS.colors.border,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
            } }, "\u2605")))),
        react_1.default.createElement("textarea", { placeholder: "Your review...", value: review, onChange: (e) => setReview(e.target.value), style: {
                width: '100%',
                minHeight: 100,
                padding: tokens_1.DESIGN_TOKENS.spacing.md,
                borderRadius: tokens_1.DESIGN_TOKENS.radius.input,
                border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
                ...tokens_1.DESIGN_TOKENS.typography.body,
                fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
                resize: 'vertical',
                marginBottom: tokens_1.DESIGN_TOKENS.spacing.md,
            } }),
        react_1.default.createElement("button", { onClick: () => onSubmit?.(rating, review), disabled: rating === 0, style: {
                width: '100%',
                padding: '12px 24px',
                border: 'none',
                borderRadius: tokens_1.DESIGN_TOKENS.radius.button,
                background: rating > 0 ? tokens_1.DESIGN_TOKENS.colors.primary : tokens_1.DESIGN_TOKENS.colors.border,
                color: 'white',
                ...tokens_1.DESIGN_TOKENS.typography.bodyMedium,
                cursor: rating > 0 ? 'pointer' : 'not-allowed',
            } }, "Submit Review")));
};
exports.ReviewCard = ReviewCard;
