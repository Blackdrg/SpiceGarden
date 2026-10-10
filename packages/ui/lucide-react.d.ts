// Type declarations for all icons used across the monorepo
// This allows TypeScript to compile without the actual lucide-react types
declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';

  type LucideIconProps = SVGProps<SVGSVGElement> & {
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
    fill?: string;
  };

  // Export all icon names as React components
  // The actual icons will be resolved at runtime from the JS package
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
  export const Headphones: FC<LucideIconProps>;
  export const Volume2: FC<LucideIconProps>;
  export const VolumeX: FC<LucideIconProps>;
  export const Gift: FC<LucideIconProps>;
  export const FileText: FC<LucideIconProps>;
  export const Check: FC<LucideIconProps>;
  export const X: FC<LucideIconProps>;
  export const Store: FC<LucideIconProps>;
  export const Clock: FC<LucideIconProps>;
  export const Utensils: FC<LucideIconProps>;
  export const AlertTriangle: FC<LucideIconProps>;
  export const Layers: FC<LucideIconProps>;
  export const ShoppingBag: FC<LucideIconProps>;
  export const ChevronRight: FC<LucideIconProps>;
  export const ArrowRight: FC<LucideIconProps>;
  export const TrendingUp: FC<LucideIconProps>;
  export const TrendingDown: FC<LucideIconProps>;
  export const CheckCircle2: FC<LucideIconProps>;
  export const ArrowLeft: FC<LucideIconProps>;
  export const UserCheck: FC<LucideIconProps>;
  export const UserMinus: FC<LucideIconProps>;
  export const Repeat: FC<LucideIconProps>;
  export const Award: FC<LucideIconProps>;
  export const Filter: FC<LucideIconProps>;
  export const Calendar: FC<LucideIconProps>;
  export const Download: FC<LucideIconProps>;
  export const RefreshCw: FC<LucideIconProps>;
  export const ChevronLeft: FC<LucideIconProps>;
  export const ChevronDown: FC<LucideIconProps>;
  export const ChevronUp: FC<LucideIconProps>;
  export const IndianRupee: FC<LucideIconProps>;
  export const Percent: FC<LucideIconProps>;
  export const ArrowUpDown: FC<LucideIconProps>;
  export const Sparkles: FC<LucideIconProps>;
  export const Building: FC<LucideIconProps>;
  export const Briefcase: FC<LucideIconProps>;
  export const ShieldCheck: FC<LucideIconProps>;
  export const Tag: FC<LucideIconProps>;
  export const RotateCw: FC<LucideIconProps>;
  export const CheckCheck: FC<LucideIconProps>;
  export const Copy: FC<LucideIconProps>;
  export const Share2: FC<LucideIconProps>;
  export const Zap: FC<LucideIconProps>;
  export const LifeBuoy: FC<LucideIconProps>;
  export const LogOut: FC<LucideIconProps>;
  export const Heart: FC<LucideIconProps>;
  export const ArrowUpRight: FC<LucideIconProps>;
  export const ArrowDownLeft: FC<LucideIconProps>;
  export const Phone: FC<LucideIconProps>;
  export const MessageSquare: FC<LucideIconProps>;
  export const Navigation: FC<LucideIconProps>;
  export const Minus: FC<LucideIconProps>;
  export const SlidersHorizontal: FC<LucideIconProps>;
}