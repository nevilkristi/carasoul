import produce from "immer";
import {
  SET_ERROR,
  SET_PROFILE,
  LOGOUT,
  SET_LOADING,
  SET_TOKEN,
  SET_IS_AUTH,
  PROFILE_LOADING,
  SET_UNAUTHORIZED,
} from "./actionTypes";

const initialState = {
  user: null,
  token: "",
  error: "",
  loading: false,
  isAuth: false,
  profileLoading: false,
  isUnauthorized: false,
};

const authReducer = produce((state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case SET_ERROR:
      state.error = payload;
      break;
    case SET_PROFILE:
      state.user = payload;
      state.isAuth = true;
      break;
    case SET_TOKEN:
      state.token = payload;
      break;
    case LOGOUT:
      state.user = null;
      state.token = "";
      state.isAuth = false;
      break;
    case SET_LOADING:
      state.loading = payload;
      break;
    case SET_IS_AUTH:
      state.isAuth = payload;
      break;

    case PROFILE_LOADING:
      state.profileLoading = payload;
      break;
    case SET_UNAUTHORIZED:
      state.isUnauthorized = payload;
      break;

    default:
      return state;
  }
});

export default authReducer;
