"use client";

import React from 'react';
import { DESIGN_TOKENS } from './tokens';
import { Skeleton } from './Skeleton';

interface ProductListSkeletonProps {
  count?: number;
}

export const ProductListSkeleton = ({ count = 3 }: ProductListSkeletonProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.lg }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        display: 'flex',
        gap: DESIGN_TOKENS.spacing.md,
        backgroundColor: DESIGN_TOKENS.colors.surface,
        borderRadius: DESIGN_TOKENS.radius.card,
        padding: DESIGN_TOKENS.spacing.lg,
        border: `1px solid ${DESIGN_TOKENS.colors.border}`,
      }}>
        <Skeleton variant="rectangular" width={80} height={80} borderRadius={12} />
        <div style={{ flex: 1 }}>
          <Skeleton height={16} width="70%" style={{ marginBottom: DESIGN_TOKENS.spacing.sm }} />
          <Skeleton height={14} width="40%" style={{ marginBottom: DESIGN_TOKENS.spacing.md }} />
          <Skeleton height={12} width="60%" />
        </div>
        <Skeleton height={20} width={60} />
      </div>
    ))}
  </div>
);

interface MenuListSkeletonProps {
  count?: number;
}

export const MenuListSkeleton = ({ count = 4 }: MenuListSkeletonProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.lg }}>
    <Skeleton height={24} width="40%" style={{ marginBottom: DESIGN_TOKENS.spacing.md }} />
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        display: 'flex',
        gap: DESIGN_TOKENS.spacing.md,
        alignItems: 'flex-start',
      }}>
        <Skeleton variant="rectangular" width={60} height={60} borderRadius={12} />
        <div style={{ flex: 1 }}>
          <Skeleton height={16} width="80%" style={{ marginBottom: DESIGN_TOKENS.spacing.sm }} />
          <Skeleton height={14} width="60%" />
        </div>
      </div>
    ))}
  </div>
);

interface CheckoutSkeletonProps {
  itemCount?: number;
}

export const CheckoutSkeleton = ({ itemCount = 2 }: CheckoutSkeletonProps) => (
  <div style={{ padding: DESIGN_TOKENS.spacing.lg }}>
    <Skeleton height={24} width="60%" style={{ marginBottom: DESIGN_TOKENS.spacing.lg }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.md, marginBottom: DESIGN_TOKENS.spacing.lg }}>
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.md, alignItems: 'center' }}>
          <Skeleton variant="rectangular" width={60} height={60} borderRadius={12} />
          <div style={{ flex: 1 }}>
            <Skeleton height={14} width="60%" style={{ marginBottom: 4 }} />
            <Skeleton height={12} width="40%" />
          </div>
          <Skeleton height={16} width={50} />
        </div>
      ))}
    </div>
    <Skeleton height={1} width="100%" style={{ marginBottom: DESIGN_TOKENS.spacing.lg }} />
    <Skeleton height={16} width="100%" style={{ marginBottom: DESIGN_TOKENS.spacing.sm }} />
    <Skeleton height={16} width="80%" style={{ marginBottom: DESIGN_TOKENS.spacing.sm }} />
    <Skeleton height={16} width="60%" style={{ marginBottom: DESIGN_TOKENS.spacing.xl }} />
    <Skeleton height={48} width="100%" borderRadius={12} />
  </div>
);

interface TrackingSkeletonProps {
  stages?: number;
}

export const TrackingSkeleton = ({ stages = 4 }: TrackingSkeletonProps) => (
  <div style={{ padding: DESIGN_TOKENS.spacing.lg }}>
    <Skeleton height={24} width="50%" style={{ marginBottom: DESIGN_TOKENS.spacing.lg }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.lg, marginBottom: DESIGN_TOKENS.spacing.xl }}>
      {Array.from({ length: stages }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.md, alignItems: 'center' }}>
          <Skeleton variant="circular" width={32} height={32} />
          <div style={{ flex: 1 }}>
            <Skeleton height={14} width="50%" style={{ marginBottom: 4 }} />
            <Skeleton height={12} width="70%" />
          </div>
        </div>
      ))}
    </div>
    <Skeleton height={120} width="100%" borderRadius={12} style={{ marginBottom: DESIGN_TOKENS.spacing.lg }} />
    <Skeleton height={48} width="100%" borderRadius={12} />
  </div>
);

interface TimelineTrackingSkeletonProps {
  stages?: number;
}

export const TimelineTrackingSkeleton = ({ stages = 4 }: TimelineTrackingSkeletonProps) => (
  <div style={{ padding: DESIGN_TOKENS.spacing.lg }}>
    <Skeleton height={24} width="40%" style={{ marginBottom: DESIGN_TOKENS.spacing.lg }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.xl }}>
      {Array.from({ length: stages }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.md }}>
          <Skeleton variant="circular" width={40} height={40} />
          <div style={{ flex: 1 }}>
            <Skeleton height={14} width="60%" style={{ marginBottom: 6 }} />
            <Skeleton height={12} width="40%" />
          </div>
        </div>
      ))}
    </div>
  </div>
);