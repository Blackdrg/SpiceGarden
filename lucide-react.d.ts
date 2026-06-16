declare module 'lucide-react' {
  import { SVGProps } from 'react';
  
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number;
  }

  export const Plus: (props: LucideProps) => JSX.Element;
  export const MapPin: (props: LucideProps) => JSX.Element;
  export const Trash2: (props: LucideProps) => JSX.Element;
  export const Star: (props: LucideProps) => JSX.Element;
  export const AlertCircle: (props: LucideProps) => JSX.Element;
  export const CheckCircle: (props: LucideProps) => JSX.Element;
  export const ShoppingCart: (props: LucideProps) => JSX.Element;
  export const Package: (props: LucideProps) => JSX.Element;
  export const CreditCard: (props: LucideProps) => JSX.Element;
  export const Wallet: (props: LucideProps) => JSX.Element;
  export const Truck: (props: LucideProps) => JSX.Element;
  export const Bike: (props: LucideProps) => JSX.Element;
  export const Flame: (props: LucideProps) => JSX.Element;
  export const ChefHat: (props: LucideProps) => JSX.Element;
  export const Home: (props: LucideProps) => JSX.Element;
  export const User: (props: LucideProps) => JSX.Element;
  export const Search: (props: LucideProps) => JSX.Element;
  export const Map: (props: LucideProps) => JSX.Element;
  export const Bell: (props: LucideProps) => JSX.Element;
  export const BellOff: (props: LucideProps) => JSX.Element;
  export const BarChart3: (props: LucideProps) => JSX.Element;
  export const Users: (props: LucideProps) => JSX.Element;
  export const ShieldAlert: (props: LucideProps) => JSX.Element;
}