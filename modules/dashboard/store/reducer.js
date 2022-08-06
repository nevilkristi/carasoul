import {
  LOADING_DELETE_FEED,
  SET_ADD_FEED_SUCCESS,
  SET_FEEDS,
  SET_LOADING_FEEDS,
  SET_UPDATE_FEED_SUCCESS,
  DELETE_FEED_SUCCESS,
  LOADING_DELETE_SLIDESHOW,
  DELETE_SLIDESHOW_SUCCESS,
  UPDATE_SLIDESHOW_SUCCESS,
  LOADING_UPDATE_SLIDESHOW,
  LOADING_COPY_SLIDESHOW,
  COPY_SLIDESHOW,
  LOADING_ACTIVE_DE_ACTIVE,
  PUBLISHED,
  SET_MOVE_SLIDESHOW,
  SET_LOADING_MOVE_SLIDESHOW,
  SET_LOADING_ADD_UPDATE_FEED,
  LOADING_ADD_GROW_SLIDESHOW,
  LOADING_ADD_SLIDESHOW,
  SET_SLIDESHOW_SCHEDULE_ACTIVE_DATE_TIME,
} from "./actionTypes";
import produce from "immer";
import cloneDeep from "lodash.clonedeep";

const initialState = {
  loadingFeeds: false,
  feeds: [],
  loadingAddUpdateFeed: false,
  loadingDeleteFeed: false,
  loadingDeleteSlideshow: false,
  loadingUpdateSlideshow: false,
  loadingCopySlideshow: false,
  loadingActiveDeActive: false,
  loadingMoveSlideshow: false,
  loadingAddGrowSlideshow: false,
  loadingAddSlideshow: false,
};
const feedsReducer = produce((state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case SET_LOADING_FEEDS:
      state.loadingFeeds = payload;
      break;
    case SET_FEEDS:
      state.feeds = payload;
      break;
    case SET_ADD_FEED_SUCCESS:
      state.feeds.push(payload);
      break;
    case SET_UPDATE_FEED_SUCCESS:
      state.feeds.forEach(x => {
        if (x.feed_id === payload.feed_id) {
          x.title = payload.title;
        }
      });
      break;
    case LOADING_DELETE_FEED:
      state.loadingDeleteFeed = payload;
      break;
    case DELETE_FEED_SUCCESS:
      state.feeds = state.feeds.filter(x => x.feed_id !== payload);
      break;

    case LOADING_DELETE_SLIDESHOW:
      state.loadingDeleteSlideshow = payload;
      break;
    case DELETE_SLIDESHOW_SUCCESS:
      state.feeds.forEach(feed => {
        if (feed.feed_id === payload.feed_id) {
          feed.gs_slideshows = feed.gs_slideshows.filter(
            x => x.slideshow_id !== payload.slideshow_id
          );
        }
      });
      break;
    case LOADING_UPDATE_SLIDESHOW:
      state.loadingUpdateSlideshow = payload;
      break;
    case UPDATE_SLIDESHOW_SUCCESS:
      state.feeds.forEach(feed => {
        if (feed.feed_id === payload.feed_id) {
          feed.gs_slideshows.forEach(x => {
            if (x.slideshow_id === payload.slideshow_id) {
              x.title = payload.title;
            }
          });
        }
      });
      break;
    case LOADING_COPY_SLIDESHOW:
      state.loadingCopySlideshow = payload;
      break;
    case COPY_SLIDESHOW:
      var copyData = {};
      state.feeds.forEach(feed => {
        if (feed.feed_id === payload.feed_id) {
          copyData = cloneDeep(
            feed.gs_slideshows.find(
              x => x.slideshow_id === payload.copied_slideshow_id
            )
          );
          copyData.slideshow_id = payload.new_slideshow_id;
          copyData.is_active = false;
          if (copyData) {
            feed.gs_slideshows.push(copyData);
          }
        }
      });
      break;

    case LOADING_ACTIVE_DE_ACTIVE:
      state.loadingActiveDeActive = payload;
      break;
    case PUBLISHED:
      state.feeds.forEach(feed => {
        if (feed.feed_id === payload.feed_id) {
          feed.gs_slideshows.forEach(ss => {
            if (ss.slideshow_id === payload.slideshow_id) {
              ss.is_active = payload.is_active;
            } else if (ss.is_active) {
              ss.is_active = false;
            }
          });
        }
      });
      break;
    case SET_MOVE_SLIDESHOW:
      let move_slide = null;

      state.feeds.forEach(feed => {
        if (feed.feed_id === payload.from_feed_id) {
          move_slide = feed.gs_slideshows.find(
            ss => ss.slideshow_id === payload.slideshow_id
          );
          if (!!move_slide) {
            feed.gs_slideshows = feed.gs_slideshows.filter(
              ss => ss.slideshow_id !== payload.slideshow_id
            );
          }
        }
      });
      state.feeds.forEach(feed => {
        if (feed.feed_id === payload.to_feed_id) {
          feed.gs_slideshows.push(move_slide);
        }
      });
      break;

    case SET_LOADING_MOVE_SLIDESHOW:
      state.loadingMoveSlideshow = payload;
      break;

    case SET_LOADING_ADD_UPDATE_FEED:
      state.loadingAddUpdateFeed = payload;
      break;
    case LOADING_ADD_GROW_SLIDESHOW:
      state.loadingAddGrowSlideshow = payload;
      break;
    case LOADING_ADD_SLIDESHOW:
      state.loadingAddSlideshow = payload;
      break;
    case SET_SLIDESHOW_SCHEDULE_ACTIVE_DATE_TIME:
      state.feeds.forEach(feed => {
        if (feed.feed_id === payload.feed_id) {
          feed.gs_slideshows.forEach(ss => {
            if (ss.slideshow_id === payload.slideshow_id) {
              ss.schedule_active_date_time = payload.schedule_active_date_time;
            }
          });
        }
      });
      break;

    default:
      return state;
  }
});
export default feedsReducer;
