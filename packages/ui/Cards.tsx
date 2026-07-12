"use client";

import React from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';

export interface FoodCardProps {
  image?: string;
  title: string;
  price: number | string;
  rating?: number;
  offerBadge?: string;
  isVeg?: boolean;
  spiceLevel?: 1 | 2 | 3;
  onPress?: () => void;
  style?: React.CSSProperties;
}

export const FoodCard = ({
  image,
  title,
  price,
  rating,
  offerBadge,
  isVeg,
  spiceLevel,
  onPress,
  style,
}: FoodCardProps) => {
  const spiceLabels = { 1: 'Mild', 2: 'Medium', 3: 'Hot' };
  
  return (
    <div
      onClick={onPress}
      role={onPress ? 'button' : undefined}
      tabIndex={onPress ? 0 : undefined}
      style={{
        display: 'flex',
        gap: DESIGN_TOKENS.spacing[3],
        backgroundColor: DESIGN_TOKENS.colors.surface,
        borderRadius: DESIGN_TOKENS.radius.xl,
        padding: DESIGN_TOKENS.spacing[6],
        border: `1px solid ${DESIGN_TOKENS.colors.border}`,
        boxShadow: DESIGN_TOKENS.shadows.small,
        transition: `transform ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
        cursor: onPress ? 'pointer' : 'default',
        ...style,
      }}
    >
      {image && (
        <img
          src={image}
          alt={title}
          style={{
            width: 64,
            height: 64,
            borderRadius: DESIGN_TOKENS.radius.md,
            objectFit: 'cover',
          }}
        />
      )}
      <div style={{ flex: 1 }}>
        <span style={{
          ...DESIGN_TOKENS.typography.bodyMedium,
          color: DESIGN_TOKENS.colors.textPrimary,
          display: 'block',
          marginBottom: 4,
        }}>
          {title}
        </span>
        <span style={{
          ...DESIGN_TOKENS.typography.headingS,
          color: DESIGN_TOKENS.colors.primary,
          fontWeight: 600,
        }}>
          ₹{price}
        </span>
        {rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <span style={{ color: '#ffd700' }}>★</span>
            <span style={{ ...DESIGN_TOKENS.typography.caption, color: DESIGN_TOKENS.colors.textSecondary }}>
              {rating.toFixed(1)}
            </span>
          </div>
        )}
        {isVeg !== undefined && (
          <span style={{
            marginTop: 4,
            padding: '2px 8px',
            fontSize: 11,
            borderRadius: 4,
            background: isVeg ? '#e8f5e8' : '#fff5f5',
            color: isVeg ? DESIGN_TOKENS.colors.success : DESIGN_TOKENS.colors.danger,
          }}>
            {isVeg ? 'Veg' : 'Non-Veg'}
          </span>
        )}
        {spiceLevel && (
          <span style={{
            marginTop: 4,
            ...DESIGN_TOKENS.typography.caption,
            color: DESIGN_TOKENS.colors.warning,
          }}>
            {spiceLabels[spiceLevel]}
          </span>
        )}
      </div>
      {offerBadge && (
        <span style={{
          padding: '4px 8px',
          background: DESIGN_TOKENS.colors.success,
          color: 'white',
          borderRadius: DESIGN_TOKENS.radius.sm,
          fontSize: 11,
          fontWeight: 600,
        }}>
          {offerBadge}
        </span>
      )}
    </div>
  );
};

export interface MenuCardProps {
  title: string;
  description?: string;
  price?: number | string;
  image?: string;
  variant?: 'section' | 'item' | 'combo';
  onPress?: () => void;
}

export const MenuCard = ({
  title,
  description,
  price,
  image,
  variant = 'item',
  onPress,
}: MenuCardProps) => {
  if (variant === 'section') {
    return (
      <div style={{
        padding: DESIGN_TOKENS.spacing[6],
        backgroundColor: DESIGN_TOKENS.colors.surface,
        borderRadius: DESIGN_TOKENS.radius.xl,
        border: `1px solid ${DESIGN_TOKENS.colors.border}`,
      }}>
        <h3 style={{
          margin: 0,
          ...DESIGN_TOKENS.typography.headingM,
          color: DESIGN_TOKENS.colors.textPrimary,
        }}>
          {title}
        </h3>
        {description && (
          <p style={{
            margin: '8px 0 0 0',
            ...DESIGN_TOKENS.typography.body,
            color: DESIGN_TOKENS.colors.textSecondary,
          }}>
            {description}
        </p>
        )}
      </div>
    );
  }

  if (variant === 'combo') {
    return (
      <div
        onClick={onPress}
        role={onPress ? 'button' : undefined}
        style={{
          display: 'flex',
          gap: DESIGN_TOKENS.spacing[3],
          backgroundColor: '#fff8f0',
          borderRadius: DESIGN_TOKENS.radius.xl,
          padding: DESIGN_TOKENS.spacing[6],
          border: `2px dashed ${DESIGN_TOKENS.colors.primary}`,
          cursor: onPress ? 'pointer' : 'default',
        }}
      >
        <div style={{ flex: 1 }}>
          <span style={{
            ...DESIGN_TOKENS.typography.bodyMedium,
            fontWeight: 600,
            color: DESIGN_TOKENS.colors.textPrimary,
            display: 'block',
            marginBottom: 4,
          }}>
            {title}
          </span>
          {description && (
            <span style={{
              ...DESIGN_TOKENS.typography.caption,
              color: DESIGN_TOKENS.colors.textSecondary,
            }}>
              {description}
            </span>
          )}
        </div>
        <span style={{
          ...DESIGN_TOKENS.typography.headingS,
          color: DESIGN_TOKENS.colors.primary,
        }}>
          ₹{price}
        </span>
      </div>
    );
  }

  // Default item variant
  return (
    <div
      onClick={onPress}
      role={onPress ? 'button' : undefined}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: DESIGN_TOKENS.spacing[6],
        backgroundColor: DESIGN_TOKENS.colors.surface,
        borderRadius: DESIGN_TOKENS.radius.xl,
        border: `1px solid ${DESIGN_TOKENS.colors.border}`,
        cursor: onPress ? 'pointer' : 'default',
      }}
    >
      <div style={{ flex: 1 }}>
        <span style={{
          ...DESIGN_TOKENS.typography.bodyMedium,
          color: DESIGN_TOKENS.colors.textPrimary,
          display: 'block',
        }}>
          {title}
        </span>
        {description && (
          <span style={{
            ...DESIGN_TOKENS.typography.caption,
            color: DESIGN_TOKENS.colors.textSecondary,
            display: 'block',
            marginTop: 4,
          }}>
            {description}
          </span>
        )}
      </div>
      {price && (
        <span style={{
          ...DESIGN_TOKENS.typography.bodyMedium,
          color: DESIGN_TOKENS.colors.primary,
          fontWeight: 600,
        }}>
          ₹{price}
        </span>
      )}
    </div>
  );
};

export interface MapCardProps {
  eta: number;
  riderName?: string;
  riderAvatar?: string;
  progress?: number;
}

export const MapCard = ({ eta, riderName, riderAvatar, progress = 0 }: MapCardProps) => {
  const progressColor = progress < 30 ? DESIGN_TOKENS.colors.primary :
    progress < 70 ? DESIGN_TOKENS.colors.warning : DESIGN_TOKENS.colors.success;

  return (
    <div style={{
      backgroundColor: DESIGN_TOKENS.colors.surface,
      borderRadius: DESIGN_TOKENS.radius.xl,
      padding: DESIGN_TOKENS.spacing[6],
      border: `1px solid ${DESIGN_TOKENS.colors.border}`,
      boxShadow: DESIGN_TOKENS.shadows.medium,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[3], marginBottom: DESIGN_TOKENS.spacing[3] }}>
        {riderAvatar && (
          <img
            src={riderAvatar}
            alt={riderName || 'Rider'}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <span style={{
            ...DESIGN_TOKENS.typography.bodyMedium,
            color: DESIGN_TOKENS.colors.textPrimary,
            display: 'block',
          }}>
            {riderName || 'Driver'}
          </span>
          <span style={{
            ...DESIGN_TOKENS.typography.caption,
            color: DESIGN_TOKENS.colors.textSecondary,
          }}>
            On the way
          </span>
        </div>
        <span style={{
          padding: '6px 12px',
          background: '#f0f8ff',
          color: DESIGN_TOKENS.colors.primary,
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
        }}>
          ETA: {eta} min
        </span>
      </div>
      
      <div style={{ height: 6, borderRadius: 3, backgroundColor: '#eee', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: progressColor,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
};

export interface TrackingCardProps {
  status: 'preparing' | 'picked-up' | 'on-the-way' | 'delivered';
  eta?: number;
  address?: string;
  onContact?: () => void;
  onSupport?: () => void;
}

export const TrackingCard = ({ status, eta, address, onContact, onSupport }: TrackingCardProps) => {
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

  return (
    <div style={{
      backgroundColor: DESIGN_TOKENS.colors.surface,
      borderRadius: DESIGN_TOKENS.radius.xl,
      padding: DESIGN_TOKENS.spacing[6],
      border: `1px solid ${DESIGN_TOKENS.colors.border}`,
      boxShadow: DESIGN_TOKENS.shadows.small,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[3] }}>
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: statusColors[status],
        }} />
        <span style={{
          ...DESIGN_TOKENS.typography.bodyMedium,
          color: DESIGN_TOKENS.colors.textPrimary,
          flex: 1,
        }}>
          {statusLabels[status]}
        </span>
        {eta && (
          <span style={{
            ...DESIGN_TOKENS.typography.bodyMedium,
            color: DESIGN_TOKENS.colors.primary,
            fontWeight: 600,
          }}>
            {eta} min
          </span>
        )}
      </div>
      {address && (
        <p style={{
          margin: '12px 0 0 0',
          ...DESIGN_TOKENS.typography.caption,
          color: DESIGN_TOKENS.colors.textSecondary,
        }}>
          {address}
        </p>
      )}
      {(onContact || onSupport) && (
        <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm, marginTop: DESIGN_TOKENS.spacing[3] }}>
          {onContact && (
            <button
              onClick={onContact}
              style={{
                flex: 1,
                padding: '8px 16px',
                border: `1px solid ${DESIGN_TOKENS.colors.primary}`,
                borderRadius: DESIGN_TOKENS.radius.lg,
                background: 'transparent',
                color: DESIGN_TOKENS.colors.primary,
                ...DESIGN_TOKENS.typography.bodyMedium,
                cursor: 'pointer',
              }}
            >
              Contact Driver
            </button>
          )}
          {onSupport && (
            <button
              onClick={onSupport}
              style={{
                flex: 1,
                padding: '8px 16px',
                border: 'none',
                borderRadius: DESIGN_TOKENS.radius.lg,
                background: DESIGN_TOKENS.colors.elevated,
                color: DESIGN_TOKENS.colors.textPrimary,
                ...DESIGN_TOKENS.typography.bodyMedium,
                cursor: 'pointer',
              }}
            >
              Support
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export interface ReviewCardProps {
  orderId: string;
  onSubmit?: (rating: number, review: string) => void;
}

export const ReviewCard = ({ orderId, onSubmit }: ReviewCardProps) => {
  const [rating, setRating] = React.useState(0);
  const [review, setReview] = React.useState('');

  return (
    <div style={{
      backgroundColor: DESIGN_TOKENS.colors.surface,
      borderRadius: DESIGN_TOKENS.radius.xl,
      padding: DESIGN_TOKENS.spacing[6],
      border: `1px solid ${DESIGN_TOKENS.colors.border}`,
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        ...DESIGN_TOKENS.typography.headingS,
        color: DESIGN_TOKENS.colors.textPrimary,
      }}>
        Rate Your Order
      </h3>
      
      <div style={{ display: 'flex', gap: 8, marginBottom: DESIGN_TOKENS.spacing[6] }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            style={{
              fontSize: 32,
              color: star <= rating ? '#ffd700' : DESIGN_TOKENS.colors.border,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        placeholder="Your review..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
        style={{
          width: '100%',
          minHeight: 100,
          padding: DESIGN_TOKENS.spacing[3],
          borderRadius: DESIGN_TOKENS.radius.lg,
          border: `1px solid ${DESIGN_TOKENS.colors.border}`,
          ...DESIGN_TOKENS.typography.body,
          fontFamily: DESIGN_TOKENS.typography.fontFamily,
          resize: 'vertical',
          marginBottom: DESIGN_TOKENS.spacing[3],
        }}
      />

      <button
        onClick={() => onSubmit?.(rating, review)}
        disabled={rating === 0}
        style={{
          width: '100%',
          padding: '12px 24px',
          border: 'none',
          borderRadius: DESIGN_TOKENS.radius.lg,
          background: rating > 0 ? DESIGN_TOKENS.colors.primary : DESIGN_TOKENS.colors.border,
          color: 'white',
          ...DESIGN_TOKENS.typography.bodyMedium,
          cursor: rating > 0 ? 'pointer' : 'not-allowed',
        }}
      >
        Submit Review
      </button>
    </div>
  );
};