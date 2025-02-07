const initialState = { profile: {} };

export default function profileReducer(state = initialState, action) {
  switch (action.type) {
    case "UPDATE_PROFILE":
      return { ...state, profile: action.payload };
    default:
      return state;
  }
}
