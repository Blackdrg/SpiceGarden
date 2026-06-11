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
/* eslint-disable */
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const native_1 = require("@react-navigation/native");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const ui_1 = require("@spicegarden/ui");
const AuthScreen = () => {
    const [isLogin, setIsLogin] = (0, react_1.useState)(true);
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [name, setName] = (0, react_1.useState)('');
    const [phone, setPhone] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)('');
    const [emailError, setEmailError] = (0, react_1.useState)('');
    const [passwordError, setPasswordError] = (0, react_1.useState)('');
    const navigation = (0, native_1.useNavigation)();
    const fadeAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const shakeAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(() => {
        react_native_1.Animated.timing(fadeAnim, {
            toValue: 1,
            duration: ui_1.DESIGN_TOKENS.motion.page,
            easing: react_native_1.Easing.out(react_native_1.Easing.quad),
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);
    const validateEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
            setEmailError('Email is required');
        }
        else if (!emailRegex.test(value)) {
            setEmailError('Please enter a valid email');
        }
        else {
            setEmailError('');
        }
    };
    const validatePassword = (value) => {
        if (!value) {
            setPasswordError('Password is required');
        }
        else if (value.length < 6) {
            setPasswordError('Password must be at least 6 characters');
        }
        else {
            setPasswordError('');
        }
    };
    const API_URL = 'http://localhost:3001';
    const handleSubmit = async () => {
        setError('');
        validateEmail(email);
        validatePassword(password);
        if (!isLogin && !name) {
            setError('Name is required');
            return;
        }
        if (!isLogin && !phone) {
            setError('Phone number is required');
            return;
        }
        if (emailError || passwordError)
            return;
        setLoading(true);
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    ...(!isLogin && { name, phone }),
                    deviceName: 'mobile',
                    deviceType: 'mobile',
                }),
            });
            const data = await response.json();
            if (response.ok) {
                await async_storage_1.default.setItem('sg_token', data.access_token);
                await async_storage_1.default.setItem('sg_user', JSON.stringify({
                    email,
                    name: isLogin ? '' : name,
                    phone: isLogin ? '' : phone,
                }));
                navigation.replace('Main');
            }
            else {
                setError(data.message || (isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.'));
                shakeAnimation();
            }
        }
        catch (err) {
            setError('Network error. Please check your connection and try again.');
            shakeAnimation();
        }
        finally {
            setLoading(false);
        }
    };
    const shakeAnimation = () => {
        react_native_1.Animated.sequence([
            react_native_1.Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            react_native_1.Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            react_native_1.Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            react_native_1.Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };
    return (<react_native_1.Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }}>
      <react_native_1.View style={styles.container}>
        <react_native_1.View style={styles.header}>
          <react_native_1.Text style={styles.headerText}>SpiceGarden</react_native_1.Text>
          <react_native_1.Text style={styles.headerSubtext}>Order food from your favourite restaurants</react_native_1.Text>
        </react_native_1.View>

        <react_native_1.View style={styles.formContainer}>
          {!isLogin && (<react_native_1.View style={styles.inputGroup}>
              <react_native_1.Text style={styles.inputLabel}>Full Name</react_native_1.Text>
              <react_native_1.TextInput placeholder="Enter your full name" value={name} onChangeText={setName} style={styles.input}/>
            </react_native_1.View>)}

          {!isLogin && (<react_native_1.View style={styles.inputGroup}>
              <react_native_1.Text style={styles.inputLabel}>Phone Number</react_native_1.Text>
              <react_native_1.TextInput placeholder="Enter your phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input}/>
            </react_native_1.View>)}

          <react_native_1.View style={styles.inputGroup}>
            <react_native_1.Text style={styles.inputLabel}>Email Address</react_native_1.Text>
            <react_native_1.TextInput placeholder="Enter your email" value={email} onChangeText={(text) => {
            setEmail(text);
            if (emailError)
                validateEmail(text);
        }} autoCapitalize="none" keyboardType="email-address" style={[styles.input, emailError ? styles.inputError : null]}/>
            {emailError && <react_native_1.Text style={styles.fieldError}>{emailError}</react_native_1.Text>}
          </react_native_1.View>

          <react_native_1.View style={styles.inputGroup}>
            <react_native_1.Text style={styles.inputLabel}>Password</react_native_1.Text>
            <react_native_1.TextInput placeholder="Enter your password" value={password} onChangeText={(text) => {
            setPassword(text);
            if (passwordError)
                validatePassword(text);
        }} secureTextEntry style={[styles.input, passwordError ? styles.inputError : null]}/>
            {passwordError && <react_native_1.Text style={styles.fieldError}>{passwordError}</react_native_1.Text>}
          </react_native_1.View>

          {error && (<react_native_1.View style={styles.errorContainer}>
              <react_native_1.Text style={styles.errorText}>{error}</react_native_1.Text>
            </react_native_1.View>)}

          <react_native_1.TouchableOpacity onPress={handleSubmit} style={[styles.button, loading ? styles.buttonLoading : null]}>
            <react_native_1.Text style={styles.buttonText}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </react_native_1.Text>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>

        <react_native_1.View style={styles.divider}>
          <react_native_1.View style={styles.dividerLine}/>
          <react_native_1.Text style={styles.dividerText}>OR</react_native_1.Text>
          <react_native_1.View style={styles.dividerLine}/>
        </react_native_1.View>

        <react_native_1.TouchableOpacity onPress={() => {
            setIsLogin(!isLogin);
            setError('');
        }} style={styles.toggleButton}>
          <react_native_1.Text style={styles.toggleButtonText}>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>
    </react_native_1.Animated.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.background,
        padding: ui_1.DESIGN_TOKENS.spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: ui_1.DESIGN_TOKENS.spacing.xl,
    },
    headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: ui_1.DESIGN_TOKENS.colors.primary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    headerSubtext: {
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        marginTop: 4,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    formContainer: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: ui_1.DESIGN_TOKENS.spacing.md,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        marginBottom: ui_1.DESIGN_TOKENS.spacing.xs,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: ui_1.DESIGN_TOKENS.colors.border,
        borderRadius: ui_1.DESIGN_TOKENS.radius.input,
        paddingHorizontal: ui_1.DESIGN_TOKENS.spacing.md,
        fontSize: 16,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    inputError: {
        borderColor: ui_1.DESIGN_TOKENS.colors.danger,
    },
    fieldError: {
        fontSize: 12,
        color: ui_1.DESIGN_TOKENS.colors.danger,
        marginTop: 4,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    errorContainer: {
        marginBottom: ui_1.DESIGN_TOKENS.spacing.sm,
    },
    errorText: {
        color: ui_1.DESIGN_TOKENS.colors.danger,
        fontSize: 14,
        textAlign: 'center',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    button: {
        height: 50,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: ui_1.DESIGN_TOKENS.radius.button,
        marginTop: ui_1.DESIGN_TOKENS.spacing.md,
    },
    buttonLoading: {
        opacity: 0.7,
    },
    buttonText: {
        color: ui_1.DESIGN_TOKENS.colors.textInverse,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: ui_1.DESIGN_TOKENS.spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.border,
    },
    dividerText: {
        paddingHorizontal: ui_1.DESIGN_TOKENS.spacing.md,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        fontSize: 14,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    toggleButton: {
        alignItems: 'center',
    },
    toggleButtonText: {
        color: ui_1.DESIGN_TOKENS.colors.primary,
        fontSize: 14,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
});
exports.default = AuthScreen;
