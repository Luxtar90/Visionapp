/**
 * Studios Slice
 * Redux slice for managing studios state
 */

import { Studio } from '@/types/api';

// Action Types
const FETCH_STUDIOS_REQUEST = 'studios/fetchRequest';
const FETCH_STUDIOS_SUCCESS = 'studios/fetchSuccess';
const FETCH_STUDIOS_FAILURE = 'studios/fetchFailure';
const FETCH_STUDIO_DETAIL_REQUEST = 'studios/fetchDetailRequest';
const FETCH_STUDIO_DETAIL_SUCCESS = 'studios/fetchDetailSuccess';
const FETCH_STUDIO_DETAIL_FAILURE = 'studios/fetchDetailFailure';

// State Interface
interface StudiosState {
  studios: Studio[];
  selectedStudio: Studio | null;
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: StudiosState = {
  studios: [],
  selectedStudio: null,
  loading: false,
  error: null,
};

// Reducer
export default function studiosReducer(state = initialState, action: any): StudiosState {
  switch (action.type) {
    case FETCH_STUDIOS_REQUEST:
    case FETCH_STUDIO_DETAIL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_STUDIOS_SUCCESS:
      return {
        ...state,
        loading: false,
        studios: action.payload,
      };
    case FETCH_STUDIO_DETAIL_SUCCESS:
      return {
        ...state,
        loading: false,
        selectedStudio: action.payload,
      };
    case FETCH_STUDIOS_FAILURE:
    case FETCH_STUDIO_DETAIL_FAILURE:
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
export const fetchStudiosRequest = () => ({
  type: FETCH_STUDIOS_REQUEST,
});

export const fetchStudiosSuccess = (studios: Studio[]) => ({
  type: FETCH_STUDIOS_SUCCESS,
  payload: studios,
});

export const fetchStudiosFailure = (error: string) => ({
  type: FETCH_STUDIOS_FAILURE,
  payload: error,
});

export const fetchStudioDetailRequest = () => ({
  type: FETCH_STUDIO_DETAIL_REQUEST,
});

export const fetchStudioDetailSuccess = (studio: Studio) => ({
  type: FETCH_STUDIO_DETAIL_SUCCESS,
  payload: studio,
});

export const fetchStudioDetailFailure = (error: string) => ({
  type: FETCH_STUDIO_DETAIL_FAILURE,
  payload: error,
});

// Thunk Actions
export const fetchStudios = () => async (dispatch: any) => {
  dispatch(fetchStudiosRequest());
  try {
    // API call would go here
    // const response = await apiService.get<Studio[]>('/studios');
    // dispatch(fetchStudiosSuccess(response));
    // return response;
  } catch (error: any) {
    dispatch(fetchStudiosFailure(error.message));
    throw error;
  }
};

export const fetchStudioDetail = (studioId: number) => async (dispatch: any) => {
  dispatch(fetchStudioDetailRequest());
  try {
    // API call would go here
    // const response = await apiService.get<Studio>(`/studios/${studioId}`);
    // dispatch(fetchStudioDetailSuccess(response));
    // return response;
  } catch (error: any) {
    dispatch(fetchStudioDetailFailure(error.message));
    throw error;
  }
};
