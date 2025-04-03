import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define el tipo para el usuario
export interface User {
  id: number;
  name: string;
  email: string;
  role?: string | { id: number; nombre: string; descripcion: string };
  profileImage?: string;
}

// Define el estado inicial
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

// Crea el slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state: AuthState) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state: AuthState, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state: AuthState, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state: AuthState) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    updateUserProfile: (state: AuthState, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  }
});

// Exporta las acciones
export const { loginStart, loginSuccess, loginFailure, logout, updateUserProfile } = authSlice.actions;

// Exporta el reducer
export default authSlice.reducer;
