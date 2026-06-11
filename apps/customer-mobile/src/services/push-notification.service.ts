import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(userId: string) {
  if (!Constants.isDevice) {
    return { success: false, reason: 'Must use physical device for push notifications' };
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return { success: false, reason: 'Permission not granted for push notifications' };
  }

  const token = await Notifications.getExpoPushTokenAsync();
  const expoPushToken = token.data;

  await AsyncStorage.setItem('expo_push_token', expoPushToken);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('order-updates', {
      name: 'Order Updates',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF4444',
      sound: null,
    });
  }

  return { success: true, token: expoPushToken };
}

export async function unregisterPushNotifications(userId: string) {
  await AsyncStorage.removeItem('expo_push_token');
  return { success: true };
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: 'default',
    },
    trigger: null,
  });
}

export function addPushNotificationListener(
  handler: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(handler);
}

export function addPushNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}