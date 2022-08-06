import { combineReducers } from "redux";
import profileReducers from "modules/layout/store/reducer";
import authReducer from "store/auth/reducer";
import feedsReducer from "modules/dashboard/store/reducer";
import slidrReducer from "modules/slidr/store/reducer";

export default combineReducers({
  profile: profileReducers,
  auth: authReducer,
  feeds: feedsReducer,
  slidr: slidrReducer,
});
