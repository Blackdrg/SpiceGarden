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
/* eslint-disable @typescript-eslint/no-unused-vars */
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const native_1 = require("@react-navigation/native");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const ui_1 = require("@spicegarden/ui");
const Haptics = __importStar(require("expo-haptics"));
const ProfileScreen = () => {
    const navigation = (0, native_1.useNavigation)();
    const [userData, setUserData] = (0, react_1.useState)({
        fullName: '',
        email: '',
        phone: '',
    });
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [isEditing, setIsEditing] = (0, react_1.useState)(false);
    const [editFormData, setEditFormData] = (0, react_1.useState)({
        fullName: '',
        email: '',
        phone: '',
    });
    const [errors, setErrors] = (0, react_1.useState)({
        fullName: '',
        email: '',
        phone: '',
    });
    const fadeAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(() => {
        const loadProfile = async () => {
            try {
                const userJson = await async_storage_1.default.getItem('sg_user');
                if (userJson) {
                    try {
                        const user = JSON.parse(userJson);
                        if (user && typeof user === 'object') {
                            setUserData({
                                fullName: user.name || '',
                                email: user.email || '',
                                phone: user.phone || '',
                            });
                            setEditFormData({
                                fullName: user.name || '',
                                email: user.email || '',
                                phone: user.phone || '',
                            });
                        }
                    }
                    catch {
                        await async_storage_1.default.removeItem('sg_user');
                    }
                }
            }
            catch (error) {
                console.error('Failed to load profile:', error);
            }
            finally {
                setLoading(false);
                react_native_1.Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: ui_1.DESIGN_TOKENS.motion.page,
                    easing: react_native_1.Easing.out(react_native_1.Easing.quad),
                    useNativeDriver: true,
                }).start();
            }
        };
        loadProfile();
    }, [fadeAnim]);
    const validateEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
            setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
            return false;
        }
        setErrors(prev => ({ ...prev, email: '' }));
        return true;
    };
    const handleSaveProfile = async () => {
        if (!validateEmail(editFormData.email))
            return;
        try {
            await async_storage_1.default.setItem('sg_user', JSON.stringify({
                name: editFormData.fullName,
                email: editFormData.email,
                phone: editFormData.phone,
            }));
            setUserData({
                fullName: editFormData.fullName,
                email: editFormData.email,
                phone: editFormData.phone,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsEditing(false);
        }
        catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };
    const handleLogout = async () => {
        try {
            await async_storage_1.default.removeItem('sg_token');
            await async_storage_1.default.removeItem('sg_user');
            navigation.replace('Auth');
        }
        catch (error) {
            console.error('Logout error:', error);
        }
    };
    if (loading) {
        return (<react_native_1.View style={styles.loadingContainer} accessible={true} accessibilityLabel="Loading profile" accessibilityRole="progressbar">
        <react_native_1.Animated.View style={{ opacity: fadeAnim }}>
          <react_native_1.View style={styles.loadingSpinner}/>
          <react_native_1.Text style={styles.loadingText}>Loading profile...</react_native_1.Text>
        </react_native_1.Animated.View>
      </react_native_1.View>);
    }
    const menuItems = [
        { id: 'wallet', label: 'Wallet', icon: '💰', screen: 'Wallet' },
        { id: 'orders', label: 'My Orders', icon: '📦', screen: 'History' },
        { id: 'addresses', label: 'Addresses', icon: '📍', screen: 'Addresses' },
        { id: 'payment', label: 'Payment Methods', icon: '💳', screen: 'Payment' },
        { id: 'notifications', label: 'Notifications', icon: '🔔', screen: 'Notifications' },
        { id: 'support', label: 'Help & Support', icon: '❓', screen: 'Support' },
    ];
    return (<react_native_1.Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <react_native_1.View style={styles.container}>
        <react_native_1.View style={styles.header}>
          <react_native_1.View style={styles.headerContent}>
            <react_native_1.Text style={styles.headerText}>
              {isEditing ? 'Edit Profile' : 'Profile'}
            </react_native_1.Text>
          </react_native_1.View>
          {!isEditing && (<react_native_1.TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton} accessibilityLabel="Edit profile" accessibilityRole="button">
              <react_native_1.Text style={styles.editButtonText}>Edit</react_native_1.Text>
            </react_native_1.TouchableOpacity>)}
        </react_native_1.View>

        <react_native_1.View style={styles.content}>
          {isEditing ? (<react_native_1.View style={styles.editForm}>
              <react_native_1.View style={styles.inputGroup}>
                <react_native_1.Text style={styles.inputLabel}>Full Name</react_native_1.Text>
                <react_native_1.TextInput placeholder="Enter your full name" value={editFormData.fullName} onChangeText={(text) => setEditFormData({ ...editFormData, fullName: text })} style={styles.input} accessibilityLabel="Full name"/>
              </react_native_1.View>
              <react_native_1.View style={styles.inputGroup}>
                <react_native_1.Text style={styles.inputLabel}>Email</react_native_1.Text>
                <react_native_1.TextInput placeholder="Enter your email" value={editFormData.email} onChangeText={(text) => {
                setEditFormData({ ...editFormData, email: text });
                if (errors.email)
                    validateEmail(text);
            }} autoCapitalize="none" keyboardType="email-address" style={styles.input} accessibilityLabel="Email address"/>
                {errors.email && <react_native_1.Text style={styles.fieldError}>{errors.email}</react_native_1.Text>}
              </react_native_1.View>
              <react_native_1.View style={styles.inputGroup}>
                <react_native_1.Text style={styles.inputLabel}>Phone Number</react_native_1.Text>
                <react_native_1.TextInput placeholder="Enter your phone number" value={editFormData.phone} onChangeText={(text) => setEditFormData({ ...editFormData, phone: text })} keyboardType="phone-pad" style={styles.input} accessibilityLabel="Phone number"/>
              </react_native_1.View>
              <react_native_1.TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton} accessibilityLabel="Save profile changes" accessibilityRole="button">
                <react_native_1.Text style={styles.saveButtonText}>Save Changes</react_native_1.Text>
              </react_native_1.TouchableOpacity>
              <react_native_1.TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelButton} accessibilityLabel="Cancel editing" accessibilityRole="button">
                <react_native_1.Text style={styles.cancelButtonText}>Cancel</react_native_1.Text>
              </react_native_1.TouchableOpacity>
            </react_native_1.View>) : (<>
              <react_native_1.View style={styles.profileHeader}>
                <react_native_1.View style={styles.profileImageContainer}>
                  <react_native_1.Text style={styles.profileImage}>👤</react_native_1.Text>
                </react_native_1.View>
                <react_native_1.View style={styles.profileInfo}>
                  <react_native_1.Text style={styles.profileName}>{userData.fullName || 'User Name'}</react_native_1.Text>
                  <react_native_1.Text style={styles.profileEmail}>{userData.email || 'email@example.com'}</react_native_1.Text>
                  <react_native_1.Text style={styles.profilePhone}>📞 {userData.phone || '+91 XXXXX XXXXX'}</react_native_1.Text>
                </react_native_1.View>
              </react_native_1.View>

              <react_native_1.View style={styles.statsContainer}>
                <react_native_1.View style={styles.statBox}>
                  <react_native_1.Text style={styles.statNumber}>24</react_native_1.Text>
                  <react_native_1.Text style={styles.statLabel}>Orders</react_native_1.Text>
                </react_native_1.View>
                <react_native_1.View style={styles.statBox}>
                  <react_native_1.Text style={styles.statNumber}>4.8</react_native_1.Text>
                  <react_native_1.Text style={styles.statLabel}>Rating</react_native_1.Text>
                </react_native_1.View>
                <react_native_1.View style={styles.statBox}>
                  <react_native_1.Text style={styles.statNumber}>SPICE+</react_native_1.Text>
                  <react_native_1.Text style={styles.statLabel}>Member</react_native_1.Text>
                </react_native_1.View>
              </react_native_1.View>

              <react_native_1.View style={styles.menuSection}>
                <react_native_1.Text style={styles.sectionTitle}>Account</react_native_1.Text>
                {menuItems.map((item) => (<react_native_1.TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => navigation.navigate(item.screen)} accessibilityLabel={`Go to ${item.label}`} accessibilityRole="link">
                    <react_native_1.Text style={styles.menuItemIcon}>{item.icon}</react_native_1.Text>
                    <react_native_1.Text style={styles.menuItemText}>{item.label}</react_native_1.Text>
                    <react_native_1.Text style={styles.menuItemArrow}>›</react_native_1.Text>
                  </react_native_1.TouchableOpacity>))}
              </react_native_1.View>

              <react_native_1.TouchableOpacity onPress={handleLogout} style={styles.logoutButton} accessibilityLabel="Sign out of your account" accessibilityRole="button">
                <react_native_1.Text style={styles.logoutButtonText}>Sign Out</react_native_1.Text>
              </react_native_1.TouchableOpacity>
            </>)}
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.Animated.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingSpinner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: ui_1.DESIGN_TOKENS.colors.primary,
        borderTopColor: 'transparent',
    },
    loadingText: {
        fontSize: 16,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        marginTop: 16,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: ui_1.DESIGN_TOKENS.spacing.md,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: ui_1.DESIGN_TOKENS.colors.border,
    },
    headerContent: {
        flex: 1,
    },
    headerText: {
        fontSize: 20,
        fontWeight: '600',
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    editButton: {
        padding: ui_1.DESIGN_TOKENS.spacing.xs,
    },
    editButtonText: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.primary,
        fontWeight: '500',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    content: {
        flex: 1,
    },
    profileHeader: {
        alignItems: 'center',
        padding: ui_1.DESIGN_TOKENS.spacing.xl,
    },
    profileImageContainer: {
        width: 80,
        height: 80,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.primary,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: ui_1.DESIGN_TOKENS.spacing.md,
    },
    profileImage: {
        fontSize: 36,
        color: 'white',
    },
    profileInfo: {
        alignItems: 'center',
    },
    profileName: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 4,
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    profileEmail: {
        fontSize: 16,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        marginBottom: 4,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    profilePhone: {
        fontSize: 14,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: ui_1.DESIGN_TOKENS.spacing.lg,
        paddingHorizontal: ui_1.DESIGN_TOKENS.spacing.md,
    },
    statBox: {
        alignItems: 'center',
        padding: ui_1.DESIGN_TOKENS.spacing.sm,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    statLabel: {
        fontSize: 12,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
        marginTop: 4,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    menuSection: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.surface,
        borderRadius: ui_1.DESIGN_TOKENS.radius.card,
        overflow: 'hidden',
        marginHorizontal: ui_1.DESIGN_TOKENS.spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        padding: ui_1.DESIGN_TOKENS.spacing.md,
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: ui_1.DESIGN_TOKENS.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: ui_1.DESIGN_TOKENS.colors.border,
    },
    menuItemIcon: {
        fontSize: 16,
        marginRight: 12,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        color: ui_1.DESIGN_TOKENS.colors.textPrimary,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    menuItemArrow: {
        fontSize: 16,
        color: ui_1.DESIGN_TOKENS.colors.textSecondary,
    },
    logoutButton: {
        margin: ui_1.DESIGN_TOKENS.spacing.md,
        backgroundColor: ui_1.DESIGN_TOKENS.colors.elevated,
        borderRadius: ui_1.DESIGN_TOKENS.radius.button,
        paddingVertical: 12,
    },
    logoutButtonText: {
        fontSize: 16,
        color: ui_1.DESIGN_TOKENS.colors.dangerDark,
        fontWeight: '500',
        textAlign: 'center',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    editForm: {
        padding: ui_1.DESIGN_TOKENS.spacing.md,
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
    fieldError: {
        fontSize: 12,
        color: ui_1.DESIGN_TOKENS.colors.danger,
        marginTop: 4,
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    saveButton: {
        backgroundColor: ui_1.DESIGN_TOKENS.colors.primary,
        paddingVertical: 12,
        borderRadius: ui_1.DESIGN_TOKENS.radius.button,
        alignItems: 'center',
        marginVertical: ui_1.DESIGN_TOKENS.spacing.xs,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
    cancelButton: {
        paddingVertical: 12,
        borderRadius: ui_1.DESIGN_TOKENS.radius.button,
        alignItems: 'center',
        marginVertical: ui_1.DESIGN_TOKENS.spacing.xs,
        borderWidth: 1,
        borderColor: ui_1.DESIGN_TOKENS.colors.primary,
    },
    cancelButtonText: {
        color: ui_1.DESIGN_TOKENS.colors.primary,
        fontSize: 16,
        fontWeight: '500',
        fontFamily: ui_1.DESIGN_TOKENS.typography.fontFamily,
    },
});
exports.default = ProfileScreen;
