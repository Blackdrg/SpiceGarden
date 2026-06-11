"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const native_1 = require("@react-navigation/native");
const native_stack_1 = require("@react-navigation/native-stack");
const i18n_1 = require("./src/constants/i18n");
const AuthScreen_1 = __importDefault(require("./src/screens/AuthScreen"));
const HomeScreen_1 = __importDefault(require("./src/screens/HomeScreen"));
const CartScreen_1 = __importDefault(require("./src/screens/CartScreen"));
const ProfileScreen_1 = __importDefault(require("./src/screens/ProfileScreen"));
const TrackingScreen_1 = __importDefault(require("./src/screens/TrackingScreen"));
const HistoryScreen_1 = __importDefault(require("./src/screens/HistoryScreen"));
const Stack = (0, native_stack_1.createStackNavigator)();
const Tab = (0, native_stack_1.createBottomTabNavigator)();
function AppNavigator() {
    return (<native_1.NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen_1.default}/>
        <Stack.Screen name="Main" component={MainTabNavigator}/>
        <Stack.Screen name="Tracking" component={TrackingScreen_1.default}/>
        <Stack.Screen name="OrderDetails" component={HistoryScreen_1.default}/>
      </Stack.Navigator>
    </native_1.NavigationContainer>);
}
function MainTabNavigator() {
    return (<Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen_1.default} options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => (<react_native_1.Text style={{ color, fontSize: size }}>🏠</react_native_1.Text>)
        }}/>
      <Tab.Screen name="Search" component={HomeScreen_1.default} options={{
            tabBarLabel: 'Search',
            tabBarIcon: ({ color, size }) => (<react_native_1.Text style={{ color, fontSize: size }}>🔍</react_native_1.Text>)
        }}/>
      <Tab.Screen name="Cart" component={CartScreen_1.default} options={{
            tabBarLabel: 'Cart',
            tabBarIcon: ({ color, size }) => (<react_native_1.Text style={{ color, fontSize: size }}>🛒</react_native_1.Text>)
        }}/>
      <Tab.Screen name="Profile" component={ProfileScreen_1.default} options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (<react_native_1.Text style={{ color, fontSize: size }}>👤</react_native_1.Text>)
        }}/>
    </Tab.Navigator>);
}
function App() {
    return (<i18n_1.LocaleProvider>
      <AppNavigator />
    </i18n_1.LocaleProvider>);
}
