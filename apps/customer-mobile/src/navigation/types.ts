import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CartItem } from '../services/order.service';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Tracking: { orderId?: string };
  OrderDetails: { orderId: string };
  Checkout: { cartItems: CartItem[] };
  Address: undefined;
  Home: undefined;
  Restaurant: { restaurantId: string; slug?: string };
  Legal: undefined;
  Privacy: undefined;
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Cart: undefined;
  Profile: undefined;
};

export type OrderHistoryScreenNavigationProp = NativeStackScreenProps<RootStackParamList, 'Main'>['navigation'];

export type TrackingScreenParams = {
  orderId: string;
};

export type OrderDetailsScreenParams = {
  orderId: string;
};

export type CheckoutScreenParams = {
  cartItems: CartItem[];
};