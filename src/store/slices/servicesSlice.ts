/**
 * Services Slice
 * Redux slice for managing services state
 */

import { Service } from '@/types/api';

// Action Types
const FETCH_SERVICES_REQUEST = 'services/fetchRequest';
const FETCH_SERVICES_SUCCESS = 'services/fetchSuccess';
const FETCH_SERVICES_FAILURE = 'services/fetchFailure';
const FETCH_SERVICE_DETAIL_REQUEST = 'services/fetchDetailRequest';
const FETCH_SERVICE_DETAIL_SUCCESS = 'services/fetchDetailSuccess';
const FETCH_SERVICE_DETAIL_FAILURE = 'services/fetchDetailFailure';

// State Interface
interface ServicesState {
  services: Service[];
  selectedService: Service | null;
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: ServicesState = {
  services: [],
  selectedService: null,
  loading: false,
  error: null,
};

// Reducer
export default function servicesReducer(state = initialState, action: any): ServicesState {
  switch (action.type) {
    case FETCH_SERVICES_REQUEST:
    case FETCH_SERVICE_DETAIL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_SERVICES_SUCCESS:
      return {
        ...state,
        loading: false,
        services: action.payload,
      };
    case FETCH_SERVICE_DETAIL_SUCCESS:
      return {
        ...state,
        loading: false,
        selectedService: action.payload,
      };
    case FETCH_SERVICES_FAILURE:
    case FETCH_SERVICE_DETAIL_FAILURE:
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
export const fetchServicesRequest = () => ({
  type: FETCH_SERVICES_REQUEST,
});

export const fetchServicesSuccess = (services: Service[]) => ({
  type: FETCH_SERVICES_SUCCESS,
  payload: services,
});

export const fetchServicesFailure = (error: string) => ({
  type: FETCH_SERVICES_FAILURE,
  payload: error,
});

export const fetchServiceDetailRequest = () => ({
  type: FETCH_SERVICE_DETAIL_REQUEST,
});

export const fetchServiceDetailSuccess = (service: Service) => ({
  type: FETCH_SERVICE_DETAIL_SUCCESS,
  payload: service,
});

export const fetchServiceDetailFailure = (error: string) => ({
  type: FETCH_SERVICE_DETAIL_FAILURE,
  payload: error,
});

// Thunk Actions
export const fetchServices = (studioId?: number) => async (dispatch: any) => {
  dispatch(fetchServicesRequest());
  try {
    // API call would go here
    // const endpoint = studioId ? `/studios/${studioId}/services` : '/services';
    // const response = await apiService.get<Service[]>(endpoint);
    // dispatch(fetchServicesSuccess(response));
    // return response;
  } catch (error: any) {
    dispatch(fetchServicesFailure(error.message));
    throw error;
  }
};

export const fetchServiceDetail = (serviceId: number) => async (dispatch: any) => {
  dispatch(fetchServiceDetailRequest());
  try {
    // API call would go here
    // const response = await apiService.get<Service>(`/services/${serviceId}`);
    // dispatch(fetchServiceDetailSuccess(response));
    // return response;
  } catch (error: any) {
    dispatch(fetchServiceDetailFailure(error.message));
    throw error;
  }
};
