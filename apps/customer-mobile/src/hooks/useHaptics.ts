export const useHaptics = () => {
  const impactAsync = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (process.env.NODE_ENV === 'test') return;
    try {
      const Haptics = require('expo-haptics');
      const impactStyles = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      };
      await Haptics.impactAsync(impactStyles[style]);
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  };

  const notificationAsync = async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (process.env.NODE_ENV === 'test') return;
    try {
      const Haptics = require('expo-haptics');
      const notificationTypes = {
        success: Haptics.NotificationFeedbackType.Success,
        warning: Haptics.NotificationFeedbackType.Warning,
        error: Haptics.NotificationFeedbackType.Error,
      };
      await Haptics.notificationAsync(notificationTypes[type]);
    } catch (error) {
      console.warn('Notification haptics not available:', error);
    }
  };

  return { impactAsync, notificationAsync };
};