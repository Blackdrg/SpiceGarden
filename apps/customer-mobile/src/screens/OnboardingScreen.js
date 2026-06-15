"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const ui_1 = require("@spicegarden/ui");
const onboardingSlides = [
    {
        id: 'welcome',
        title: 'Welcome to SpiceGarden',
        subtitle: 'Your favourite food from top restaurants, delivered hot & fresh',
        icon: 'Menu',
        backgroundColor: '#1a1e2e',
    },
    {
        id: 'tracking',
        title: 'Live Order Tracking',
        subtitle: 'Track your order in real-time with GPS. Know exactly when your food arrives',
        icon: 'Location',
        backgroundColor: '#16213e',
    },
    {
        id: 'safety',
        title: 'Safe & Reliable',
        subtitle: 'Verified restaurants, contactless delivery, and secure payments',
        icon: 'Secure',
        backgroundColor: '#0f3460',
    },
    {
        id: 'delivery',
        title: 'Lightning Fast Delivery',
        subtitle: 'Our drivers race against time to get your food to you ASAP',
        icon: '🚀',
        backgroundColor: '#1e4620',
    },
];
const OnboardingScreen = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = (0, react_1.useState)(0);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const fadeAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    const slideAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const scaleAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    const animateTransition = (0, react_1.useCallback)((toIndex) => {
        react_native_1.Animated.sequence([
            react_native_1.Animated.parallel([
                react_native_1.Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    easing: react_native_1.Easing.out(react_native_1.Easing.quad),
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(slideAnim, {
                    toValue: toIndex > currentIndex ? 20 : -20,
                    duration: 150,
                    easing: react_native_1.Easing.out(react_native_1.Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
            react_native_1.Animated.parallel([
                react_native_1.Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    easing: react_native_1.Easing.out(react_native_1.Easing.quad),
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 200,
                    easing: react_native_1.Easing.out(react_native_1.Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [currentIndex, fadeAnim, slideAnim]);
    const handleNext = async () => {
        if (currentIndex < onboardingSlides.length - 1) {
            setCurrentIndex(currentIndex + 1);
            animateTransition(currentIndex + 1);
        }
        else {
            await completeOnboarding();
        }
    };
    const handleSkip = async () => {
        await completeOnboarding();
    };
    const completeOnboarding = async () => {
        setIsLoading(true);
        try {
            await async_storage_1.default.setItem('sg_onboarding_completed', 'true');
            navigation.replace('Auth');
        }
        catch (error) {
            console.error('Failed to save onboarding status:', error);
        }
    };
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            animateTransition(currentIndex - 1);
        }
    };
    const currentSlide = onboardingSlides[currentIndex];
    return (<react_native_1.View style={[styles.container, { backgroundColor: currentSlide.backgroundColor }]}>
      <react_native_1.View style={styles.progressContainer}>
        {onboardingSlides.map((slide, index) => (<react_native_1.View key={slide.id} style={[
                styles.progressDot,
                index === currentIndex && styles.progressDotActive,
                index < currentIndex && styles.progressDotCompleted,
            ]} accessible={true} accessibilityLabel={`Slide ${index + 1} of ${onboardingSlides.length}${index === currentIndex ? ', current' : ''}`} accessibilityRole="button" accessibilityState={{ selected: index === currentIndex }}/>))}
      </react_native_1.View>

      <react_native_1.Animated.View style={[
            styles.content,
            {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }, { scale: scaleAnim }]
            }
        ]}>
        <react_native_1.Text style={styles.icon} accessible={false}>
          {currentSlide.icon}
        </react_native_1.Text>
        <react_native_1.Text style={styles.title} accessible={true} accessibilityRole="header">
          {currentSlide.title}
        </react_native_1.Text>
        <react_native_1.Text style={styles.subtitle} accessible={true}>
          {currentSlide.subtitle}
        </react_native_1.Text>
      </react_native_1.Animated.View>

      <react_native_1.View style={styles.footer}>
        <react_native_1.TouchableOpacity onPress={handleSkip} style={styles.skipButton} accessibilityLabel="Skip onboarding" accessibilityRole="button">
          <react_native_1.Text style={styles.skipText}>Skip</react_native_1.Text>
        </react_native_1.TouchableOpacity>

        <react_native_1.View style={styles.navigationRow}>
          {currentIndex > 0 && (<react_native_1.TouchableOpacity onPress={handlePrevious} style={styles.navButton} accessibilityLabel="Previous slide" accessibilityRole="button">
              <react_native_1.Text style={styles.navButtonText}>Back Back</react_native_1.Text>
            </react_native_1.TouchableOpacity>)}
          
          <react_native_1.TouchableOpacity onPress={handleNext} style={[styles.navButton, styles.nextButton]} disabled={isLoading} accessibilityLabel={currentIndex === onboardingSlides.length - 1 ? "Get started" : "Next slide"} accessibilityRole="button" accessibilityState={{ disabled: isLoading }}>
            <react_native_1.Text style={[styles.navButtonText, styles.nextButtonText]}>
              {isLoading
            ? 'Loading...'
            : currentIndex === onboardingSlides.length - 1
                ? 'Get Started'
                : 'Next →'}
            </react_native_1.Text>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>

        <react_native_1.View style={styles.trustIndicators}>
          <react_native_1.View style={styles.trustRow}>
            <react_native_1.Text style={styles.trustIcon}>✓</react_native_1.Text>
            <react_native_1.Text style={styles.trustText}>10,000+ Happy Customers</react_native_1.Text>
          </react_native_1.View>
          <react_native_1.View style={styles.trustRow}>
            <react_native_1.Text style={styles.trustIcon}>✓</react_native_1.Text>
            <react_native_1.Text style={styles.trustText}>5-Star Rated Service</react_native_1.Text>
          </react_native_1.View>
          <react_native_1.View style={styles.trustRow}>
            <react_native_1.Text style={styles.trustIcon}>✓</react_native_1.Text>
            <react_native_1.Text style={styles.trustText}>Fast & Reliable Delivery</react_native_1.Text>
          </react_native_1.View>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.background,
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
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 4,
    },
    progressDotActive: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.primary,
        width: 24,
    },
    progressDotCompleted: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.success,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    icon: {
        fontSize: 80,
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    subtitle: {
        fontSize: 16,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    footer: {
        paddingBottom: 50,
        paddingHorizontal: 20,
    },
    skipButton: {
        alignSelf: 'flex-end',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    skipText: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
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
        borderRadius: ui_1.DESIGN_TOKENS.radius.button,
    },
    nextButton: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.primary,
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    nextButtonText: {
        color: 'white',
    },
    trustIndicators: {
        marginTop: 40,
        alignItems: 'center',
        gap: 8,
    },
    trustRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    trustIcon: {
        color: ui_1.DESIGN_TOKENS.colors.success,
        fontSize: 16,
    },
    trustText: {
        fontSize: 12,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
});
exports.default = OnboardingScreen;
