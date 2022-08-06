import {
  LOGOUT,
  SET_AUTH_DATA,
  SET_TOKEN,
  SET_TOKEN_LOADING,
  SET_TOKEN_ERROR,
  SET_PROFILE,
  SET_IS_AUTH,
  PROFILE_LOADING,
  SET_UNAUTHORIZED,
} from "./actionTypes";
import {
  ACCESS_TOKEN_URL,
  GET_PROFILE_INFO,
  LOG_OUT_USER,
} from "constants/urls";
import { axiosAccount } from "services/api";
import { toast } from "react-toastify";
import { clear, get } from "services/cookies";

export const logOutUser = () => {
  return async dispatch => {
    try {
      dispatch(setProfileLoading(true));
      const res = await axiosAccount.post(LOG_OUT_USER, {
        token: get("token"),
      });
      if (res.status === 200) {
        clear();
        dispatch(logout());
      }
      dispatch(setProfileLoading(false));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || err.message));
      dispatch(setProfileLoading(false));
    }
  };
};

export const fetchProfile = site_id => {
  return async dispatch => {
    try {
      dispatch(setProfileLoading(true));
      const res = await axiosAccount.get(GET_PROFILE_INFO);
      if (res.data?.data?.user) {
        dispatch(setProfileData(res.data.data.user));
      }
      dispatch(setProfileLoading(false));
    } catch (err) {
      toast(err.response?.data?.message || err.message);
      dispatch(setProfileLoading(false));
    }
  };
};

export const fetchAccessToken = (data, cb) => {
  return async dispatch => {
    try {
      dispatch(setLoading(true));
      const res = await axiosAccount.post(ACCESS_TOKEN_URL, data);
      if (res.data?.data) {
        dispatch(setToken(res.data.data.token));
        dispatch(fetchProfile());
        dispatch(setIsAuth(true));
        cb();
      }
      dispatch(setLoading(false));
    } catch (err) {
      toast(err.response?.data?.message || err.message);
      dispatch(setLoading(false));
    }
  };
};

export const setProfileData = data => ({
  type: SET_PROFILE,
  payload: data,
});

export const setAuthData = data => ({
  type: SET_AUTH_DATA,
  payload: data,
});

export const setToken = data => ({
  type: SET_TOKEN,
  payload: data,
});

export const logout = () => ({
  type: LOGOUT,
});

export const setLoading = data => ({
  type: SET_TOKEN_LOADING,
  payload: data,
});

export const setError = message => ({
  type: SET_TOKEN_ERROR,
  payload: message,
});

export const setIsAuth = data => ({
  type: SET_IS_AUTH,
  payload: data,
});

export const setProfileLoading = data => ({
  type: PROFILE_LOADING,
  payload: data,
});
export const setUnauthorized = data => ({
  type: SET_UNAUTHORIZED,
  payload: data,
});
