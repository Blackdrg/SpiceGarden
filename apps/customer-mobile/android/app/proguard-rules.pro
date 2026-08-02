# SpiceGarden Customer App - ProGuard Rules
# Add project specific ProGuard rules here.

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# expo-notifications
-keep class expo.modules.notifications.** { *; }
-keep class expo.modules.permissions.** { *; }

# expo-secure-store
-keep class expo.modules.securestore.** { *; }

# expo-location
-keep class expo.modules.location.** { *; }

# Sentry
-keep class io.sentry.** { *; }
-keepattributes @io.sentry.annotations.*

# Keep React Native bridge methods
-keepclassmembers class * {
    @com.facebook.react.uimanager.UIProp <methods>;
    @com.facebook.react.uimanager.NativeProp <methods>;
}

# Keep model classes for serialization
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    !private <fields>;
    !private <methods>;
}

# Remove logging in production
-assumenosideeffects class android.util.Log {
    public static *** v(...);
    public static *** d(...);
    public static *** i(...);
}

# Keep application class
-keep class com.spicegarden.customer.MainApplication { *; }

# Keep main activity
-keep class com.spicegarden.customer.MainActivity { *; }

# Add any project specific keep options here:
