import React from 'react';
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
export declare const FoodCard: ({ image, title, price, rating, offerBadge, isVeg, spiceLevel, onPress, style, }: FoodCardProps) => React.JSX.Element;
export interface MenuCardProps {
    title: string;
    description?: string;
    price?: number | string;
    image?: string;
    variant?: 'section' | 'item' | 'combo';
    onPress?: () => void;
}
export declare const MenuCard: ({ title, description, price, image, variant, onPress, }: MenuCardProps) => React.JSX.Element;
export interface MapCardProps {
    eta: number;
    riderName?: string;
    riderAvatar?: string;
    progress?: number;
}
export declare const MapCard: ({ eta, riderName, riderAvatar, progress }: MapCardProps) => React.JSX.Element;
export interface TrackingCardProps {
    status: 'preparing' | 'picked-up' | 'on-the-way' | 'delivered';
    eta?: number;
    address?: string;
    onContact?: () => void;
    onSupport?: () => void;
}
export declare const TrackingCard: ({ status, eta, address, onContact, onSupport }: TrackingCardProps) => React.JSX.Element;
export interface ReviewCardProps {
    orderId: string;
    onSubmit?: (rating: number, review: string) => void;
}
export declare const ReviewCard: ({ orderId, onSubmit }: ReviewCardProps) => React.JSX.Element;
//# sourceMappingURL=Cards.d.ts.map