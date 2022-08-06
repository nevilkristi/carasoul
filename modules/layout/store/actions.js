import {
  SET_MENUS,
  SET_LOADING_MENUS,
  INTRODUCTION_TOUR,
  SUBSCRIPTION_STATUS,
  SITE_LOADING,
} from "./actionTypes";
import { toast } from "react-toastify";
import { axiosAccount } from "services/api";
import { GET_MENUS, SUBSCRIPTION_STATUS_URL } from "constants/urls";

export const subscriptionStatus = siteId => {
  return async dispatch => {
    try {
      const res = await axiosAccount.get(
        `${SUBSCRIPTION_STATUS_URL + "/" + siteId}`
      );
      if (res.data?.data.is_subscribed) {
        dispatch(setSubscriptionStatus(res.data.data.is_subscribed));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };
};
export const fetchMenus = payload => async dispatch => {
  try {
    dispatch(setSiteLoading(true));
    const res = await axiosAccount.post(GET_MENUS, payload);
    if (res.data.statusCode) {
      dispatch(setSiteLoading(false));
      dispatch(
        setMenus({
          data: res?.data?.data?.application_menu,
          menu_type: payload.menu_type,
        })
      );
    }
  } catch (err) {
    toast.error(err.response?.data?.message || err.message);
  }
};

export const setMenus = data => ({
  type: SET_MENUS,
  payload: data,
});
export const setLoadingMenus = data => ({
  type: SET_LOADING_MENUS,
  payload: data,
});

export const setIntroductionTour = data => ({
  type: INTRODUCTION_TOUR,
  payload: data,
});
export const setSubscriptionStatus = data => ({
  type: SUBSCRIPTION_STATUS,
  payload: data,
});
export const setSiteLoading = data => ({
  type: SITE_LOADING,
  payload: data,
});
