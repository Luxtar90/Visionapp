import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosInstance } from 'axios';

interface ApiState {
  baseURL: string;
  axiosInstance: AxiosInstance | null;
}

const initialState: ApiState = {
  baseURL: 'http://localhost:3000/api',
  axiosInstance: null,
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setAxiosInstance: (state, action: PayloadAction<AxiosInstance>) => {
      state.axiosInstance = action.payload;
    },
    setBaseURL: (state, action: PayloadAction<string>) => {
      state.baseURL = action.payload;
    },
  },
});

export const { setAxiosInstance, setBaseURL } = apiSlice.actions;
export default apiSlice.reducer;
