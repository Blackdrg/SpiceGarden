import cartReducer, { addToCart, removeFromCart, updateQuantity, clearCart } from '../src/redux/slices/cartSlice';

describe('cartSlice', () => {
  const mockItem = { id: 'item-1', name: 'Burger', price: 100, quantity: 1 };
  const initialState = { items: [], restaurantId: null as string | null };

  it('should return initial state', () => {
    expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should add item to cart', () => {
    const state = cartReducer(initialState, addToCart({ item: mockItem, restaurantId: 'rest-1' }));
    expect(state.items).toHaveLength(1);
    expect(state.restaurantId).toBe('rest-1');
  });

  it('should update quantity when adding duplicate item', () => {
    const stateWithItem = { items: [{ ...mockItem, quantity: 2 }], restaurantId: 'rest-1' };
    const state = cartReducer(stateWithItem, addToCart({ item: mockItem, restaurantId: 'rest-1' }));
    expect(state.items[0]!.quantity).toBe(3);
  });

  it('should clear cart when switching restaurants', () => {
    const stateWithItem = { items: [{ ...mockItem, quantity: 2 }], restaurantId: 'rest-1' };
    const state = cartReducer(stateWithItem, addToCart({ item: mockItem, restaurantId: 'rest-2' }));
    expect(state.items).toHaveLength(1);
    expect(state.restaurantId).toBe('rest-2');
  });

  it('should remove item from cart', () => {
    const stateWithItem = { items: [{ ...mockItem }], restaurantId: 'rest-1' };
    const state = cartReducer(stateWithItem, removeFromCart('item-1'));
    expect(state.items).toHaveLength(0);
    expect(state.restaurantId).toBeNull();
  });

  it('should update item quantity', () => {
    const stateWithItem = { items: [{ ...mockItem, quantity: 2 }], restaurantId: 'rest-1' };
    const state = cartReducer(stateWithItem, updateQuantity({ id: 'item-1', quantity: 5 }));
    expect(state.items[0]!.quantity).toBe(5);
  });

  it('should remove item when quantity goes to 0', () => {
    const stateWithItem = { items: [{ ...mockItem, quantity: 1 }], restaurantId: 'rest-1' };
    const state = cartReducer(stateWithItem, updateQuantity({ id: 'item-1', quantity: 0 }));
    expect(state.items).toHaveLength(0);
  });

  it('should clear cart completely', () => {
    const stateWithItem = { items: [{ ...mockItem }], restaurantId: 'rest-1' };
    const state = cartReducer(stateWithItem, clearCart());
    expect(state.items).toHaveLength(0);
    expect(state.restaurantId).toBeNull();
  });
});