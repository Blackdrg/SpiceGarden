import { configureStore } from '@reduxjs/toolkit'

const dummyReducer = { reducer: (state = {}) => state }

export const store = configureStore({
  reducer: dummyReducer,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
