import { axiosSlidr } from "services/api";
import { toast } from "react-toastify";
import {
  FETCH_FEEDS_URL,
  ADD_FEED_URL,
  DELETE_FEED_URL,
  DELETE_SLIDESHOW_URL,
  UPDATE_SLIDESHOW_TITLE_URL,
  DUPLICATE_SLIDESHOW,
  ACTIVE_DE_ACTIVE_SLIDESHOW_URL,
  MOVE_SLIDESHOW_URL,
  ADD_SLIDESHOW_URL,
  ADD_SLIDESHOW_BY_SERIES_URL,
} from "constants/urls";
import {
  SET_LOADING_FEEDS,
  SET_FEEDS,
  SET_ADD_FEED_SUCCESS,
  SET_UPDATE_FEED_SUCCESS,
  LOADING_DELETE_FEED,
  DELETE_FEED_SUCCESS,
  LOADING_DELETE_SLIDESHOW,
  DELETE_SLIDESHOW_SUCCESS,
  UPDATE_SLIDESHOW_SUCCESS,
  LOADING_UPDATE_SLIDESHOW,
  COPY_SLIDESHOW,
  LOADING_COPY_SLIDESHOW,
  LOADING_ACTIVE_DE_ACTIVE,
  PUBLISHED,
  SET_MOVE_SLIDESHOW,
  SET_LOADING_MOVE_SLIDESHOW,
  SET_LOADING_ADD_UPDATE_FEED,
  LOADING_ADD_GROW_SLIDESHOW,
  LOADING_ADD_SLIDESHOW,
  SET_SLIDESHOW_SCHEDULE_ACTIVE_DATE_TIME,
} from "./actionTypes";

export const fetchFeeds = () => async dispatch => {
  try {
    dispatch(setLoadingFeeds(true));
    const res = await axiosSlidr.get(FETCH_FEEDS_URL);
    if (res?.data?.statusCode && res?.data?.data?.feeds) {
      dispatch(setLoadingFeeds(false));
      dispatch(setFeeds(res.data.data.feeds));
    }
  } catch (err) {
    dispatch(setLoadingFeeds(false));
    toast.error(err.response?.data?.message || err.message);
  }
};

export const addUpdateFeed =
  ({ payload, callBack }) =>
  async dispatch => {
    try {
      dispatch(setLoadingAddUpdateFeed(true));
      const res = await axiosSlidr.post(ADD_FEED_URL, payload);
      if (res.status) {
        dispatch(setLoadingAddUpdateFeed(false));
        if (payload.feed_id) {
          dispatch(setUpdateFeedSuccess(payload));
        } else {
          dispatch(setAddFeedSuccess(res.data?.data));
        }
        callBack();
        toast.success(res.data.message);
      }
    } catch (err) {
      dispatch(setLoadingAddUpdateFeed(false));
      toast.error(err.response?.data?.message || err.message);
    }
  };

export const deleteFeed =
  ({ feed_id, callBack }) =>
  async dispatch => {
    try {
      dispatch(setLoadingFeedsDelete(true));
      const res = await axiosSlidr.delete(`${DELETE_FEED_URL}/${feed_id}`);
      if (res.status) {
        dispatch(setLoadingFeedsDelete(false));
        dispatch(setDeleteFeedSuccess(feed_id));
        callBack();
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      dispatch(setLoadingFeedsDelete(false));
    }
  };

export const deleteSlideShow =
  ({ slideshow_id, feed_id, callBack }) =>
  async dispatch => {
    try {
      dispatch(setDeleteSlideshowSuccess({ slideshow_id, feed_id }));
      dispatch(setLoadingDeleteSlideshow(true));
      const res = await axiosSlidr.delete(
        `${DELETE_SLIDESHOW_URL}/${slideshow_id}`
      );
      if (res.status) {
        dispatch(setLoadingDeleteSlideshow(false));
        dispatch(setDeleteSlideshowSuccess({ slideshow_id, feed_id }));
        callBack();
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      dispatch(setLoadingDeleteSlideshow(false));
    }
  };

export const updateSlideshow =
  ({ slideshow_id, feed_id, title, callBack }) =>
  async dispatch => {
    try {
      dispatch(setLoadingUpdateSlideshow(true));
      const res = await axiosSlidr.put(UPDATE_SLIDESHOW_TITLE_URL, {
        title,
        slideshow_id,
      });
      if (res.status) {
        dispatch(setUpdateSlideshowSuccess({ slideshow_id, feed_id, title }));
        toast.success(res.data.message);
        callBack();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      dispatch(setLoadingUpdateSlideshow(false));
    }
  };

export const copySlideShow =
  ({ slideshow_id, feed_id, callBack }) =>
  async dispatch => {
    try {
      dispatch(setLoadingCopySlideShow(true));
      const res = await axiosSlidr.post(
        `${DUPLICATE_SLIDESHOW}/${slideshow_id}`
      );
      if (res.status && res.data?.data?.slideshow_id) {
        dispatch(setLoadingCopySlideShow(false));
        dispatch(
          setCopySlideshow({
            feed_id,
            copied_slideshow_id: slideshow_id,
            new_slideshow_id: res.data.data.slideshow_id,
          })
        );
        toast.success(res.data.message);
        callBack();
      }
    } catch (err) {
      dispatch(setLoadingCopySlideShow(false));
      toast.error(err.response?.data?.message || err.message);
    }
  };

export const activeDeActiveSlideshow =
  ({ slideshow_id, feed_id, is_active }) =>
  async dispatch => {
    try {
      dispatch(setLoadingActiveDeActive(true));
      const res = await axiosSlidr.put(ACTIVE_DE_ACTIVE_SLIDESHOW_URL, {
        is_active: is_active,
        slideshow_id,
      });
      if (res.status) {
        toast.success(res.data.message);
        dispatch(setLoadingActiveDeActive(false));
        dispatch(setActiveDeActive({ slideshow_id, feed_id, is_active }));
      }
    } catch (err) {
      dispatch(setLoadingActiveDeActive(false));
      toast.error(err.response?.data?.message || err.message);
    }
  };

export const moveSlideshow =
  ({ from_feed_id, to_feed_id, slideshow_id, callback }) =>
  async dispatch => {
    try {
      dispatch(setLoadingMoveSlideshow(true));
      const res = await axiosSlidr.put(MOVE_SLIDESHOW_URL, {
        slideshow_id: slideshow_id,
        feed_id: to_feed_id,
      });
      if (res.status) {
        dispatch(setLoadingMoveSlideshow(false));
        toast.success(res.data.message);
        dispatch(
          setMoveSlideshow({
            from_feed_id,
            to_feed_id,
            slideshow_id,
          })
        );
        callback();
      }
    } catch (err) {
      dispatch(setLoadingMoveSlideshow(false));
      toast.error(err.response?.data?.message || err.message);
    }
  };
export const addSlideshow =
  ({ payload, history }) =>
  async dispatch => {
    try {
      dispatch(setLoadingAddSlideshow(true));
      const res = await axiosSlidr.post(ADD_SLIDESHOW_URL, payload);
      if (res.status && res.data?.data?.slideshow_id) {
        dispatch(setLoadingAddSlideshow(false));
        history.push("/slidr/" + res.data.data.slideshow_id);
      }
    } catch (err) {
      dispatch(setLoadingAddSlideshow(false));
      toast.error(err.response?.data?.message || err.message);
    }
  };
export const addGrowSlideshow =
  ({ slideshow_id, feed_id, history }) =>
  async dispatch => {
    try {
      dispatch(setLoadingAddGrowSlideshow(true));
      const res = await axiosSlidr.post(ADD_SLIDESHOW_BY_SERIES_URL, {
        slideshow_id,
        feed_id,
      });
      if (res.status && res.data?.data?.slideShow?.slideshow_id) {
        dispatch(setLoadingAddGrowSlideshow(false));
        history.push("/slidr/" + res.data.data.slideShow.slideshow_id);
      }
    } catch (err) {
      dispatch(setLoadingAddGrowSlideshow(false));
      toast.error(err.response?.data?.message || err.message);
    }
  };

// getCategories
export const setLoadingFeeds = data => ({
  type: SET_LOADING_FEEDS,
  payload: data,
});

export const setFeeds = data => ({
  type: SET_FEEDS,
  payload: data,
});

export const setAddFeedSuccess = data => ({
  type: SET_ADD_FEED_SUCCESS,
  payload: data,
});
export const setUpdateFeedSuccess = data => ({
  type: SET_UPDATE_FEED_SUCCESS,
  payload: data,
});

export const setLoadingFeedsDelete = data => ({
  type: LOADING_DELETE_FEED,
  payload: data,
});
export const setDeleteFeedSuccess = data => ({
  type: DELETE_FEED_SUCCESS,
  payload: data,
});

export const setLoadingDeleteSlideshow = data => ({
  type: LOADING_DELETE_SLIDESHOW,
  payload: data,
});
export const setDeleteSlideshowSuccess = data => ({
  type: DELETE_SLIDESHOW_SUCCESS,
  payload: data,
});

export const setLoadingUpdateSlideshow = data => ({
  type: LOADING_UPDATE_SLIDESHOW,
  payload: data,
});
export const setUpdateSlideshowSuccess = data => ({
  type: UPDATE_SLIDESHOW_SUCCESS,
  payload: data,
});

export const setLoadingCopySlideShow = data => ({
  type: LOADING_COPY_SLIDESHOW,
  payload: data,
});
export const setCopySlideshow = data => ({
  type: COPY_SLIDESHOW,
  payload: data,
});

export const setLoadingActiveDeActive = data => ({
  type: LOADING_ACTIVE_DE_ACTIVE,
  payload: data,
});
export const setActiveDeActive = data => ({
  type: PUBLISHED,
  payload: data,
});
export const setMoveSlideshow = data => ({
  type: SET_MOVE_SLIDESHOW,
  payload: data,
});
export const setLoadingMoveSlideshow = data => ({
  type: SET_LOADING_MOVE_SLIDESHOW,
  payload: data,
});
export const setLoadingAddUpdateFeed = data => ({
  type: SET_LOADING_ADD_UPDATE_FEED,
  payload: data,
});
export const setLoadingAddGrowSlideshow = data => ({
  type: LOADING_ADD_GROW_SLIDESHOW,
  payload: data,
});
export const setLoadingAddSlideshow = data => ({
  type: LOADING_ADD_SLIDESHOW,
  payload: data,
});
export const setSlideshowScheduleActiveDateTime = data => ({
  type: SET_SLIDESHOW_SCHEDULE_ACTIVE_DATE_TIME,
  payload: data,
});
