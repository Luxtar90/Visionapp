/**
 * Appointments Slice
 * Redux slice for managing appointments state
 */

import { Appointment } from '@/types/api';

// Action Types
const FETCH_APPOINTMENTS_REQUEST = 'appointments/fetchRequest';
const FETCH_APPOINTMENTS_SUCCESS = 'appointments/fetchSuccess';
const FETCH_APPOINTMENTS_FAILURE = 'appointments/fetchFailure';
const CREATE_APPOINTMENT_REQUEST = 'appointments/createRequest';
const CREATE_APPOINTMENT_SUCCESS = 'appointments/createSuccess';
const CREATE_APPOINTMENT_FAILURE = 'appointments/createFailure';
const UPDATE_APPOINTMENT_REQUEST = 'appointments/updateRequest';
const UPDATE_APPOINTMENT_SUCCESS = 'appointments/updateSuccess';
const UPDATE_APPOINTMENT_FAILURE = 'appointments/updateFailure';
const CANCEL_APPOINTMENT_REQUEST = 'appointments/cancelRequest';
const CANCEL_APPOINTMENT_SUCCESS = 'appointments/cancelSuccess';
const CANCEL_APPOINTMENT_FAILURE = 'appointments/cancelFailure';

// State Interface
interface AppointmentsState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: AppointmentsState = {
  appointments: [],
  loading: false,
  error: null,
};

// Reducer
export default function appointmentsReducer(state = initialState, action: any): AppointmentsState {
  switch (action.type) {
    case FETCH_APPOINTMENTS_REQUEST:
    case CREATE_APPOINTMENT_REQUEST:
    case UPDATE_APPOINTMENT_REQUEST:
    case CANCEL_APPOINTMENT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_APPOINTMENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        appointments: action.payload,
      };
    case CREATE_APPOINTMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        appointments: [...state.appointments, action.payload],
      };
    case UPDATE_APPOINTMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        appointments: state.appointments.map(appointment => 
          appointment.id === action.payload.id ? action.payload : appointment
        ),
      };
    case CANCEL_APPOINTMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        appointments: state.appointments.map(appointment => 
          appointment.id === action.payload.id ? { ...appointment, status: 'cancelled' } : appointment
        ),
      };
    case FETCH_APPOINTMENTS_FAILURE:
    case CREATE_APPOINTMENT_FAILURE:
    case UPDATE_APPOINTMENT_FAILURE:
    case CANCEL_APPOINTMENT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}

// Action Creators
export const fetchAppointmentsRequest = () => ({
  type: FETCH_APPOINTMENTS_REQUEST,
});

export const fetchAppointmentsSuccess = (appointments: Appointment[]) => ({
  type: FETCH_APPOINTMENTS_SUCCESS,
  payload: appointments,
});

export const fetchAppointmentsFailure = (error: string) => ({
  type: FETCH_APPOINTMENTS_FAILURE,
  payload: error,
});

export const createAppointmentRequest = () => ({
  type: CREATE_APPOINTMENT_REQUEST,
});

export const createAppointmentSuccess = (appointment: Appointment) => ({
  type: CREATE_APPOINTMENT_SUCCESS,
  payload: appointment,
});

export const createAppointmentFailure = (error: string) => ({
  type: CREATE_APPOINTMENT_FAILURE,
  payload: error,
});

export const updateAppointmentRequest = () => ({
  type: UPDATE_APPOINTMENT_REQUEST,
});

export const updateAppointmentSuccess = (appointment: Appointment) => ({
  type: UPDATE_APPOINTMENT_SUCCESS,
  payload: appointment,
});

export const updateAppointmentFailure = (error: string) => ({
  type: UPDATE_APPOINTMENT_FAILURE,
  payload: error,
});

export const cancelAppointmentRequest = () => ({
  type: CANCEL_APPOINTMENT_REQUEST,
});

export const cancelAppointmentSuccess = (appointment: Appointment) => ({
  type: CANCEL_APPOINTMENT_SUCCESS,
  payload: appointment,
});

export const cancelAppointmentFailure = (error: string) => ({
  type: CANCEL_APPOINTMENT_FAILURE,
  payload: error,
});

// Thunk Actions
export const fetchAppointments = () => async (dispatch: any) => {
  dispatch(fetchAppointmentsRequest());
  try {
    // API call would go here
    // const response = await apiService.get<Appointment[]>('/appointments');
    // dispatch(fetchAppointmentsSuccess(response));
  } catch (error: any) {
    dispatch(fetchAppointmentsFailure(error.message));
  }
};

export const createAppointment = (appointmentData: any) => async (dispatch: any) => {
  dispatch(createAppointmentRequest());
  try {
    // API call would go here
    // const response = await apiService.post<Appointment>('/appointments', appointmentData);
    // dispatch(createAppointmentSuccess(response));
    // return response;
  } catch (error: any) {
    dispatch(createAppointmentFailure(error.message));
    throw error;
  }
};

export const updateAppointment = (id: number, appointmentData: any) => async (dispatch: any) => {
  dispatch(updateAppointmentRequest());
  try {
    // API call would go here
    // const response = await apiService.put<Appointment>(`/appointments/${id}`, appointmentData);
    // dispatch(updateAppointmentSuccess(response));
    // return response;
  } catch (error: any) {
    dispatch(updateAppointmentFailure(error.message));
    throw error;
  }
};

export const cancelAppointment = (id: number) => async (dispatch: any) => {
  dispatch(cancelAppointmentRequest());
  try {
    // API call would go here
    // const response = await apiService.put<Appointment>(`/appointments/${id}/cancel`);
    // dispatch(cancelAppointmentSuccess(response));
    // return response;
  } catch (error: any) {
    dispatch(cancelAppointmentFailure(error.message));
    throw error;
  }
};
