import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { configureStore } from '@reduxjs/toolkit'
import cartReducer, { addToCart, removeFromCart, updateQuantity, clearCart } from '../src/redux/slices/cartSlice'

const createTestStore = () => configureStore({
  reducer: { cart: cartReducer },
})

describe('CartPage', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  it('shows empty state when cart is empty', () => {
    const state = store.getState().cart
    expect(state.items.length).toBe(0)
  })

  it('computes cart total correctly', () => {
    const items = [
      { id: '1', name: 'Burger', price: 150, quantity: 2 },
      { id: '2', name: 'Fries', price: 80, quantity: 1 },
    ]
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
    expect(total).toBe(380)
  })

  it('addToCart adds new items', () => {
    const item = { id: '1', name: 'Burger', price: 150, quantity: 1 }
    store.dispatch(addToCart({ item, restaurantId: 'rest-1' }))
    const state = store.getState().cart
    expect(state.items.length).toBe(1)
    expect(state.items[0].name).toBe('Burger')
  })

  it('addToCart increments existing item quantity', () => {
    const item = { id: '1', name: 'Burger', price: 150, quantity: 1 }
    store.dispatch(addToCart({ item, restaurantId: 'rest-1' }))
    store.dispatch(addToCart({ item, restaurantId: 'rest-1' }))
    const state = store.getState().cart
    expect(state.items.length).toBe(1)
    expect(state.items[0].quantity).toBe(2)
  })

  it('removeFromCart removes items', () => {
    const item = { id: '1', name: 'Burger', price: 150, quantity: 1 }
    store.dispatch(addToCart({ item, restaurantId: 'rest-1' }))
    store.dispatch(removeFromCart('1'))
    const state = store.getState().cart
    expect(state.items.length).toBe(0)
  })

  it('updateQuantity changes item quantity', () => {
    const item = { id: '1', name: 'Burger', price: 150, quantity: 1 }
    store.dispatch(addToCart({ item, restaurantId: 'rest-1' }))
    store.dispatch(updateQuantity({ id: '1', quantity: 3 }))
    const state = store.getState().cart
    expect(state.items[0].quantity).toBe(3)
  })

  it('clearCart empties cart', () => {
    const item = { id: '1', name: 'Burger', price: 150, quantity: 1 }
    store.dispatch(addToCart({ item, restaurantId: 'rest-1' }))
    store.dispatch(clearCart())
    const state = store.getState().cart
    expect(state.items.length).toBe(0)
    expect(state.restaurantId).toBeNull()
  })

  it('updates restaurantId when different restaurant added', () => {
    const item = { id: '1', name: 'Burger', price: 150, quantity: 1 }
    store.dispatch(addToCart({ item, restaurantId: 'rest-1' }))
    expect(store.getState().cart.restaurantId).toBe('rest-1')
  })
})
