"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.updateQuantity = exports.removeFromCart = exports.addToCart = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const initialState = {
    items: [],
    restaurantId: null,
};
const cartSlice = (0, toolkit_1.createSlice)({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            if (state.restaurantId && state.restaurantId !== action.payload.restaurantId) {
                // In a real app, you might ask to clear cart
                state.items = [];
            }
            state.restaurantId = action.payload.restaurantId;
            const existingItem = state.items.find((i) => i.id === action.payload.item.id);
            if (existingItem) {
                existingItem.quantity += action.payload.item.quantity;
                // Note: we are not merging notes here. In a real app, you might want to combine or choose one.
                // For simplicity, we keep the existing note.
            }
            else {
                state.items.push(action.payload.item);
            }
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter((i) => i.id !== action.payload);
            if (state.items.length === 0)
                state.restaurantId = null;
        },
        updateQuantity: (state, action) => {
            const item = state.items.find((i) => i.id === action.payload.id);
            if (item) {
                if (action.payload.quantity <= 0) {
                    // Remove item if quantity is 0 or less
                    state.items = state.items.filter((i) => i.id !== action.payload.id);
                }
                else {
                    item.quantity = action.payload.quantity;
                }
            }
            if (state.items.length === 0)
                state.restaurantId = null;
        },
        clearCart: (state) => {
            state.items = [];
            state.restaurantId = null;
        },
    },
});
_a = cartSlice.actions, exports.addToCart = _a.addToCart, exports.removeFromCart = _a.removeFromCart, exports.updateQuantity = _a.updateQuantity, exports.clearCart = _a.clearCart;
exports.default = cartSlice.reducer;
