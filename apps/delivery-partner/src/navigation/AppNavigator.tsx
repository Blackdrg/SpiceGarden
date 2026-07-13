import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenName, RouteParams, Navigator, ScreenProps } from '../types';
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import RegisterScreen from '../screens/RegisterScreen';
import KycScreen from '../screens/KycScreen';
import HomeScreen from '../screens/HomeScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import TrackingScreen from '../screens/TrackingScreen';
import EarningsScreen from '../screens/EarningsScreen';
import WalletScreen from '../screens/WalletScreen';
import PayoutsScreen from '../screens/PayoutsScreen';
import RatingsScreen from '../screens/RatingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import SupportScreen from '../screens/SupportScreen';

const NavigatorContext = createContext<Navigator | null>(null);

const useNavigation = (): Navigator => {
  const ctx = useContext(NavigatorContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within AppNavigator');
  }
  return ctx;
};

const SCREENS: Record<ScreenName, React.ComponentType<ScreenProps>> = {
  Splash: SplashScreen,
  Auth: AuthScreen,
  Register: RegisterScreen,
  Kyc: KycScreen,
  Home: HomeScreen,
  OrderDetails: OrderDetailsScreen,
  Tracking: TrackingScreen,
  Earnings: EarningsScreen,
  Wallet: WalletScreen,
  Payouts: PayoutsScreen,
  Ratings: RatingsScreen,
  Notifications: NotificationsScreen,
  History: HistoryScreen,
  Profile: ProfileScreen,
  Settings: SettingsScreen,
  Emergency: EmergencyScreen,
  Support: SupportScreen,
};

export function AppNavigator(): React.JSX.Element {
  const [stack, setStack] = useState<{ name: ScreenName; params: RouteParams }[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const token = await AsyncStorage.getItem('driver_token');
      if (!active) return;
      setStack([{ name: token ? 'Home' : 'Auth', params: {} }]);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const navigate = useCallback((name: ScreenName, params: RouteParams = {}) => {
    setStack((s) => [...s, { name, params }]);
  }, []);
  const replace = useCallback((name: ScreenName, params: RouteParams = {}) => {
    setStack((s) => [...s.slice(0, -1), { name, params }]);
  }, []);
  const goBack = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);
  const reset = useCallback((name: ScreenName, params: RouteParams = {}) => {
    setStack([{ name, params }]);
  }, []);

  const navigator: Navigator = { navigate, replace, goBack, reset };

  if (!ready) {
    return <SplashScreen navigation={navigator} route={{ params: {} }} />;
  }

  const top = stack[stack.length - 1];
  const Current = SCREENS[top.name];
  return (
    <NavigatorContext.Provider value={navigator}>
      <Current navigation={navigator} route={{ params: top.params }} />
    </NavigatorContext.Provider>
  );
}
