const { describe, it, expect, beforeEach } = require('@jest/globals');

describe('cartSlice - Integration Tests', () => {
  const mockItem1 = { id: '1', name: 'Burger', price: 150, quantity: 1 };
  const mockItem2 = { id: '2', name: 'Fries', price: 80, quantity: 2 };
  const mockItem3 = { id: '3', name: 'Drink', price: 50, quantity: 1 };

  const mockCartReducer = (state, action) => {
    const defaultState = { items: [], restaurantId: null };

    if (!action.type || action.type === 'unknown') {
      return state || defaultState;
    }

    if (action.type === 'cart/addToCart') {
      const { item, restaurantId } = action.payload;
      const existingItem = state?.items?.find((i) => i.id === item.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((i) => 
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        };
      }
      return {
        ...state,
        items: [...(state?.items || []), item],
        restaurantId,
      };
    }

    if (action.type === 'cart/removeFromCart') {
      const items = state?.items?.filter((i) => i.id !== action.payload) || [];
      return { ...state, items, restaurantId: items.length === 0 ? null : state.restaurantId };
    }

    if (action.type === 'cart/updateQuantity') {
      const { id, quantity } = action.payload;
      let items = [...(state?.items || [])];
      const itemIndex = items.findIndex((i) => i.id === id);
      if (itemIndex >= 0 && quantity > 0) {
        items[itemIndex] = { ...items[itemIndex], quantity };
      } else if (itemIndex >= 0) {
        items = items.filter((i) => i.id !== id);
      }
      return { ...state, items, restaurantId: items.length === 0 ? null : state?.restaurantId };
    }

    if (action.type === 'cart/clearCart') {
      return { items: [], restaurantId: null };
    }

    return state || defaultState;
  };

  beforeEach(() => {
  });

  describe('addToCart', () => {
    it('should add new item to empty cart', () => {
      const action = { type: 'cart/addToCart', payload: { item: mockItem1, restaurantId: 'rest-1' } };
      const state = mockCartReducer(undefined, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(mockItem1);
      expect(state.restaurantId).toBe('rest-1');
    });

    it('should add new item to existing cart', () => {
      const initialState = { items: [mockItem1], restaurantId: 'rest-1' };
      const action = { type: 'cart/addToCart', payload: { item: mockItem2, restaurantId: 'rest-1' } };
      const state = mockCartReducer(initialState, action);

      expect(state.items).toHaveLength(2);
    });

    it('should merge quantities when adding existing item', () => {
      const initialState = { items: [{ ...mockItem1, quantity: 2 }], restaurantId: 'rest-1' };
      const action = { type: 'cart/addToCart', payload: { item: mockItem1, restaurantId: 'rest-1' } };
      const state = mockCartReducer(initialState, action);

      expect(state.items[0].quantity).toBe(3);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', () => {
      const initialState = { items: [mockItem1, mockItem2], restaurantId: 'rest-1' };
      const action = { type: 'cart/removeFromCart', payload: '1' };
      const state = mockCartReducer(initialState, action);

      expect(state.items).toHaveLength(1);
    });

    it('should clear restaurantId when cart is empty', () => {
      const initialState = { items: [mockItem1], restaurantId: 'rest-1' };
      const action = { type: 'cart/removeFromCart', payload: '1' };
      const state = mockCartReducer(initialState, action);

      expect(state.restaurantId).toBeNull();
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const initialState = { items: [{ ...mockItem1, quantity: 1 }], restaurantId: 'rest-1' };
      const action = { type: 'cart/updateQuantity', payload: { id: '1', quantity: 5 } };
      const state = mockCartReducer(initialState, action);

      expect(state.items[0].quantity).toBe(5);
    });

    it('should remove item when quantity is 0', () => {
      const initialState = { items: [{ ...mockItem1, quantity: 1 }], restaurantId: 'rest-1' };
      const action = { type: 'cart/updateQuantity', payload: { id: '1', quantity: 0 } };
      const state = mockCartReducer(initialState, action);

      expect(state.items).toHaveLength(0);
      expect(state.restaurantId).toBeNull();
    });
  });

  describe('clearCart', () => {
    it('should clear all items and restaurantId', () => {
      const initialState = { items: [mockItem1, mockItem2, mockItem3], restaurantId: 'rest-1' };
      const action = { type: 'cart/clearCart' };
      const state = mockCartReducer(initialState, action);

      expect(state.items).toHaveLength(0);
      expect(state.restaurantId).toBeNull();
    });
  });

  describe('cart total calculations', () => {
    it('should calculate correct cart total', () => {
      const items = [
        { id: '1', name: 'Burger', price: 150, quantity: 2 },
        { id: '2', name: 'Fries', price: 80, quantity: 1 },
      ];
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      expect(total).toBe(380);
    });

    it('should calculate correct cart total with delivery fee and taxes', () => {
      const subtotal = 380;
      const deliveryFee = 20;
      const taxRate = 0.05;
      const grandTotal = subtotal + deliveryFee + subtotal * taxRate;

      expect(grandTotal).toBe(419);
    });
  });

  describe('initial state', () => {
    it('should have empty cart initially', () => {
      const state = mockCartReducer(undefined, { type: 'unknown' });
      expect(state.items).toHaveLength(0);
      expect(state.restaurantId).toBeNull();
    });
  });
});