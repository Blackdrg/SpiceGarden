import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Easing } from 'react-native';
import Animated, { useSharedValue, withTiming, withSequence } from 'react-native-reanimated';
const AnimatedCompat = Animated as any;
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

// SCREEN_WIDTH was unused and removed

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  backgroundColor: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 'welcome',
    title: 'Welcome to SpiceGarden',
    subtitle: 'Your favourite food from top restaurants, delivered hot & fresh',
    icon: 'restaurant',
    backgroundColor: DESIGN_TOKENS.colors.primary,
  },
  {
    id: 'tracking',
    title: 'Live Order Tracking',
    subtitle: 'Track your order in real-time with GPS. Know exactly when your food arrives',
    icon: 'navigate',
    backgroundColor: DESIGN_TOKENS.colors.secondary,
  },
  {
    id: 'safety',
    title: 'Safe & Reliable',
    subtitle: 'Verified restaurants, contactless delivery, and secure payments',
    icon: 'shield-checkmark',
    backgroundColor: DESIGN_TOKENS.colors.info,
  },
  {
    id: 'delivery',
    title: 'Lightning Fast Delivery',
    subtitle: 'Our drivers race against time to get your food to you ASAP',
    icon: 'flash',
    backgroundColor: DESIGN_TOKENS.colors.success,
  },
];

const OnboardingScreen = ({ navigation }: { navigation: { replace: (screen: string) => void } }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const fadeAnim = useMemo(() => new AnimatedCompat.Value(1), []);
  const slideAnim = useMemo(() => new AnimatedCompat.Value(0), []);
  const scaleAnim = useMemo(() => new AnimatedCompat.Value(1), []);

  const animateTransition = useCallback((toIndex: number) => {
    AnimatedCompat.sequence([
      AnimatedCompat.parallel([
        AnimatedCompat.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        AnimatedCompat.timing(slideAnim, {
          toValue: toIndex > currentIndex ? 20 : -20,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      AnimatedCompat.parallel([
        AnimatedCompat.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        AnimatedCompat.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [currentIndex, fadeAnim, slideAnim]);

  const handleNext = async () => {
    setCurrentIndex((prev) => {
      if (prev < onboardingSlides.length - 1) {
        animateTransition(prev + 1);
        return prev + 1;
      }
      completeOnboarding();
      return prev;
    });
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem('sg_onboarding_completed', 'true');
      navigation.replace('Auth');
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => {
      if (prev > 0) {
        animateTransition(prev - 1);
        return prev - 1;
      }
      return prev;
    });
  };

  const currentSlide = onboardingSlides[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: currentSlide.backgroundColor }]}>
      <View style={styles.progressContainer}>
        {onboardingSlides.map((slide, index) => (
          <View
            key={slide.id}
            style={[
              styles.progressDot,
              index === currentIndex && styles.progressDotActive,
              index < currentIndex && styles.progressDotCompleted,
            ]}
            accessible={true}
            accessibilityLabel={`Slide ${index + 1} of ${onboardingSlides.length}${index === currentIndex ? ', current' : ''}`}
            accessibilityRole="button"
            accessibilityState={{ selected: index === currentIndex }}
          />
        ))}
      </View>

      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }, { scale: scaleAnim }] 
          }
        ]}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name={currentSlide.icon as any} size={48} color="white" />
          </View>
        </View>
        <Text 
          style={styles.title}
          accessible={true}
          accessibilityRole="header"
        >
          {currentSlide.title}
        </Text>
        <Text 
          style={styles.subtitle}
          accessible={true}
        >
          {currentSlide.subtitle}
        </Text>
      </Animated.View>

      <View style={styles.footer}>
        <Pressable
          onPress={handleSkip}
          style={styles.skipButton}
          accessibilityLabel="Skip onboarding"
          accessibilityRole="button"
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>

        <View style={styles.navigationRow}>
          {currentIndex > 0 && (
            <Pressable
              onPress={handlePrevious}
              style={styles.navButton}
              accessibilityLabel="Previous slide"
              accessibilityRole="button"
            >
              <Text style={styles.navButtonText}>Back Back</Text>
            </Pressable>
          )}
          
          <Pressable
            onPress={handleNext}
            style={[styles.navButton, styles.nextButton]}
            disabled={isLoading}
            accessibilityLabel={currentIndex === onboardingSlides.length - 1 ? "Get started" : "Next slide"}
            accessibilityRole="button"
            accessibilityState={{ disabled: isLoading }}
          >
            <Text style={[styles.navButtonText, styles.nextButtonText]}>
              {isLoading 
                ? 'Loading...' 
                : currentIndex === onboardingSlides.length - 1 
                  ? 'Get Started' 
                  : 'Next →'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.trustIndicators}>
          <View style={styles.trustRow}>
            <View style={styles.trustIconContainer}>
              <Ionicons name="checkmark-circle" size={16} color={DESIGN_TOKENS.colors.textPrimary} />
            </View>
            <Text style={styles.trustText}>10,000+ Happy Customers</Text>
          </View>
          <View style={styles.trustRow}>
            <View style={styles.trustIconContainer}>
              <Ionicons name="star" size={16} color={DESIGN_TOKENS.colors.warning} />
            </View>
            <Text style={styles.trustText}>5-Star Rated Service</Text>
          </View>
          <View style={styles.trustRow}>
            <View style={styles.trustIconContainer}>
              <Ionicons name="speedometer" size={16} color={DESIGN_TOKENS.colors.success} />
            </View>
            <Text style={styles.trustText}>Fast & Reliable Delivery</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: DESIGN_TOKENS.colors.borderDark + '80',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: DESIGN_TOKENS.colors.textInverse,
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: DESIGN_TOKENS.colors.textInverse + '80',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: DESIGN_TOKENS.radius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    ...DESIGN_TOKENS.shadows.medium,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: DESIGN_TOKENS.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  footer: {
    paddingBottom: 50,
    paddingHorizontal: 24,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: DESIGN_TOKENS.radius.button,
    minWidth: 100,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    ...DESIGN_TOKENS.shadows.small,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  nextButtonText: {
    color: 'white',
  },
  trustIndicators: {
    marginTop: 40,
    alignItems: 'center',
    gap: 12,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustIconContainer: {
    width: 20,
    height: 20,
    borderRadius: DESIGN_TOKENS.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustText: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textTertiary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default OnboardingScreen;
