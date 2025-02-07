import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";
import authReducer from "./reducers/authReducer";
import bookingReducer from "./reducers/bookingReducer";
import profileReducer from "./reducers/profileReducer";

const rootReducer = combineReducers({
  auth: authReducer,
  bookings: bookingReducer,
  profile: profileReducer,
});

export const store = createStore(rootReducer, applyMiddleware(thunk));
