import type { DriverProfile, DeliveryOrder, EarningsSummary } from './services/delivery-api.service';

export type ScreenName =
  | 'Splash'
  | 'Auth'
  | 'Register'
  | 'Kyc'
  | 'Home'
  | 'OrderDetails'
  | 'Tracking'
  | 'Earnings'
  | 'Wallet'
  | 'Payouts'
  | 'Ratings'
  | 'Notifications'
  | 'History'
  | 'Profile'
  | 'Settings'
  | 'Emergency'
  | 'Support'
  | 'DriverLegal';

export interface RouteParams {
  orderId?: string;
  order?: DeliveryOrder;
  [key: string]: unknown;
}

export interface Navigator {
  navigate: (name: ScreenName, params?: RouteParams) => void;
  replace: (name: ScreenName, params?: RouteParams) => void;
  goBack: () => void;
  reset: (name: ScreenName, params?: RouteParams) => void;
}

export interface ScreenProps {
  navigation: Navigator;
  route: { params: RouteParams };
}

export type { DriverProfile, DeliveryOrder, EarningsSummary };
