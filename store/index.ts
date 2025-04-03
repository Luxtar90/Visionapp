/**
 * Redux Store Configuration
 */

import { createStore, applyMiddleware, combineReducers } from 'redux';
import { thunk } from 'redux-thunk';
import appointmentsReducer from './slices/appointmentsSlice';
import servicesReducer from './slices/servicesSlice';
import studiosReducer from './slices/studiosSlice';
import productsReducer from './slices/productsSlice';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import profileReducer from './slices/profileSlice';

// Root reducer combining all slice reducers
const rootReducer = combineReducers({
  appointments: appointmentsReducer,
  services: servicesReducer,
  studios: studiosReducer,
  products: productsReducer,
  auth: authReducer,
  booking: bookingReducer,
  profile: profileReducer,
});

// Define RootState type
export type RootState = ReturnType<typeof rootReducer>;

// Configure store with middleware
const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

export default store;
