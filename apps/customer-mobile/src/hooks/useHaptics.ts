import Haptics from 'expo-haptics';

const impactStyles = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
} as const;

const notificationTypes = {
  success: Haptics.NotificationFeedbackType.Success,
  warning: Haptics.NotificationFeedbackType.Warning,
  error: Haptics.NotificationFeedbackType.Error,
} as const;

const impactAsync = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (process.env.NODE_ENV === 'test') return;
  try {
    await Haptics.impactAsync(impactStyles[style]);
  } catch (error) {
    console.warn('Haptics not available:', error);
  }
};

const notificationAsync = async (type: 'success' | 'warning' | 'error' = 'success') => {
  if (process.env.NODE_ENV === 'test') return;
  try {
    await Haptics.notificationAsync(notificationTypes[type]);
  } catch (error) {
    console.warn('Notification haptics not available:', error);
  }
};

export const useHaptics = () => {
  return { impactAsync, notificationAsync };
};