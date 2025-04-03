import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define el tipo para una reserva
export interface Booking {
  id: string;
  userId: number;
  serviceId: number;
  studioId: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

// Define el estado inicial
interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  loading: false,
  error: null
};

// Crea el slice
const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    fetchBookingsStart: (state: BookingState) => {
      state.loading = true;
      state.error = null;
    },
    fetchBookingsSuccess: (state: BookingState, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchBookingsFailure: (state: BookingState, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addBooking: (state: BookingState, action: PayloadAction<Booking>) => {
      state.bookings.push(action.payload);
    },
    updateBookingStatus: (state: BookingState, action: PayloadAction<{id: string, status: Booking['status']}>) => {
      const { id, status } = action.payload;
      const booking = state.bookings.find((booking: Booking) => booking.id === id);
      if (booking) {
        booking.status = status;
      }
    },
    cancelBooking: (state: BookingState, action: PayloadAction<string>) => {
      const bookingId = action.payload;
      const booking = state.bookings.find((booking: Booking) => booking.id === bookingId);
      if (booking) {
        booking.status = 'cancelled';
      }
    }
  }
});

// Exporta las acciones
export const { 
  fetchBookingsStart, 
  fetchBookingsSuccess, 
  fetchBookingsFailure, 
  addBooking,
  updateBookingStatus,
  cancelBooking
} = bookingSlice.actions;

// Exporta el reducer
export default bookingSlice.reducer;
