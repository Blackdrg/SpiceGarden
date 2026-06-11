"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const authSlice_1 = require("../redux/slices/authSlice");
const useAuth = () => {
    const dispatch = (0, react_redux_1.useDispatch)();
    (0, react_1.useEffect)(() => {
        // Check for token in localStorage on component mount
        const token = localStorage.getItem('sg_token');
        const userJson = localStorage.getItem('sg_user');
        if (token && userJson) {
            try {
                const user = JSON.parse(userJson);
                dispatch((0, authSlice_1.updateUser)({ user }));
                dispatch((0, authSlice_1.refreshToken)({ token }));
            }
            catch (error) {
                console.error('Error parsing auth data from localStorage:', error);
                // Clear invalid data
                localStorage.removeItem('sg_token');
                localStorage.removeItem('sg_user');
            }
        }
    }, [dispatch]);
    // Function to manually refresh token (could be called from an interceptor)
    const handleTokenRefresh = (newToken) => {
        dispatch((0, authSlice_1.refreshToken)({ token: newToken }));
    };
    return { handleTokenRefresh };
};
exports.default = useAuth;
