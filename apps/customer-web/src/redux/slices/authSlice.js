"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.refreshToken = exports.logout = exports.setCredentials = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
};
const authSlice = (0, toolkit_1.createSlice)({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            localStorage.setItem('sg_token', action.payload.token);
            localStorage.setItem('sg_user', JSON.stringify(action.payload.user));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('sg_token');
            localStorage.removeItem('sg_user');
        },
        refreshToken: (state, action) => {
            state.token = action.payload.token;
            localStorage.setItem('sg_token', action.payload.token);
        },
        updateUser: (state, action) => {
            state.user = action.payload.user;
            localStorage.setItem('sg_user', JSON.stringify(action.payload.user));
        },
    },
});
_a = authSlice.actions, exports.setCredentials = _a.setCredentials, exports.logout = _a.logout, exports.refreshToken = _a.refreshToken, exports.updateUser = _a.updateUser;
exports.default = authSlice.reducer;
