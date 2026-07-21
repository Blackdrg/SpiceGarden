// Type declarations for lucide-react icons
// Allows TypeScript compilation without @types/lucide-react

declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';

  interface LucideIconProps extends SVGProps<SVGSVGElement> {
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
    fill?: string;
  }

  // Export individual icons as function components
  export const Home: FC<LucideIconProps>;
  export const Search: FC<LucideIconProps>;
  export const ShoppingCart: FC<LucideIconProps>;
  export const CreditCard: FC<LucideIconProps>;
  export const Wallet: FC<LucideIconProps>;
  export const Bike: FC<LucideIconProps>;
  export const Truck: FC<LucideIconProps>;
  export const Flame: FC<LucideIconProps>;
  export const ChefHat: FC<LucideIconProps>;
  export const MapPin: FC<LucideIconProps>;
  export const Bell: FC<LucideIconProps>;
  export const BellOff: FC<LucideIconProps>;
  export const Star: FC<LucideIconProps>;
  export const User: FC<LucideIconProps>;
  export const CheckCircle: FC<LucideIconProps>;
  export const AlertCircle: FC<LucideIconProps>;
  export const Package: FC<LucideIconProps>;
  export const BarChart3: FC<LucideIconProps>;
  export const ShieldAlert: FC<LucideIconProps>;
  export const Users: FC<LucideIconProps>;
  export const Plus: FC<LucideIconProps>;
  export const Trash2: FC<LucideIconProps>;
}

export {};