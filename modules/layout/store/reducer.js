import {
  SET_MENUS,
  INTRODUCTION_TOUR,
  SUBSCRIPTION_STATUS,
  SITE_LOADING,
} from "./actionTypes";

import produce from "immer";

const initialState = {
  loadingMenus: false,
  menus: [],
  sites: [],
  tour: {
    dashboard: false,
    slidr: false,
  },
  subscriptionStatus: false,
  siteLoading: false,
};

const profileReducer = produce((state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case SET_MENUS:
      let State = payload.menu_type === 4 ? "sites" : "menus";
      state[State] = payload.data;
      break;
    case INTRODUCTION_TOUR:
      state.tour = { ...state.tour, ...payload };
      break;
    case SUBSCRIPTION_STATUS:
      state.subscriptionStatus = payload;
      break;
    case SITE_LOADING:
      state.siteLoading = payload;
      break;
    default:
      return state;
  }
});

export default profileReducer;
