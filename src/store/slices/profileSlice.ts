import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define el tipo para el perfil
export interface Profile {
  id?: number;
  userId?: number;
  bio?: string;
  phoneNumber?: string;
  address?: string;
  preferences?: Record<string, any>;
  notifications?: boolean;
  darkMode?: boolean;
  updatedAt?: string;
}

// Define el estado inicial
interface ProfileState {
  profile: Profile;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: {},
  loading: false,
  error: null
};

// Crea el slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    fetchProfileStart: (state: ProfileState) => {
      state.loading = true;
      state.error = null;
    },
    fetchProfileSuccess: (state: ProfileState, action: PayloadAction<Profile>) => {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchProfileFailure: (state: ProfileState, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateProfile: (state: ProfileState, action: PayloadAction<Partial<Profile>>) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    toggleDarkMode: (state: ProfileState) => {
      state.profile.darkMode = !state.profile.darkMode;
    },
    toggleNotifications: (state: ProfileState) => {
      state.profile.notifications = !state.profile.notifications;
    }
  }
});

// Exporta las acciones
export const { 
  fetchProfileStart, 
  fetchProfileSuccess, 
  fetchProfileFailure, 
  updateProfile,
  toggleDarkMode,
  toggleNotifications
} = profileSlice.actions;

// Exporta el reducer
export default profileSlice.reducer;
