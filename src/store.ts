/**
 * @deprecated Este archivo está obsoleto. Por favor, utiliza el store configurado en /store/index.ts
 * 
 * Este archivo se mantiene temporalmente para compatibilidad con código antiguo.
 * Todos los nuevos componentes deben importar el store desde /store/index.ts
 */

import { configureStore } from '@reduxjs/toolkit';
import apiReducer from './reducers/api';
import authReducer from './reducers/auth';

export const store = configureStore({
  reducer: {
    api: apiReducer,
    auth: authReducer,
  },
});

// Inferir los tipos del store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
