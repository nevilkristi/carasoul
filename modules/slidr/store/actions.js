import {
  SET_ACTIVE_SLIDE,
  SET_SLIDE,
  SET_DELETE_SLIDE,
  SET_SLIDES,
  SET_ACTIVE_FIELD,
  SET_TEXT_FIELD_VALUE,
  SET_TEXT_FIELD_DELETE,
  SET_TEXT_FIELD_COPY,
  ADD_TEXT,
  ADD_IMAGE,
  SET_IMAGE_FIELD_VALUE,
  SET_IS_IMAGE_SELECT,
  SET_VIDEO_FIELD,
  SET_BACKGROUND_FIELD,
  SET_MODAL_PREVIEW,
  SET_SLIDE_SETTINGS,
  SET_GLOBAL_COPY_FIELD,
  SET_GLOBAL_PASTE_FIELD,
  SLIDR_SLIDES_CHANGE,
  SLIDR_ACTION_UNDO,
  SLIDR_ACTION_REDO,
  SET_SLIDESHOW,
  SET_LOADING_PUBLISH_SLIDESHOW,
  CLEAR_SLIDES_STATE,
  SET_LOADING_DELETE_SLIDE,
  SET_COPY_SLIDE,
  SET_LOADING_COPY_SLIDE,
  SET_LOADING_SAVE_SLIDESHOW,
  INCREMENT_COUNT,
  DECREMENT_COUNT,
  SET_PUBLISHED_DATE_TIME,
  LOADING_GET_SLIDESHOW,
  SET_LOADING_SLIDE_SETTINGS,
} from "./actionTypes";

import { toast } from "react-toastify";

import { axiosSlidr } from "services/api";
import { generateSlideString, getVideoType, rgbaToHexA } from "utils/slider";

import store from "store";

import {
  GET_SLIDESHOW_URL,
  ADD_SLIDE_URL,
  SET_SETTINGS_URL,
  PUBLISH_SLIDESHOW_URL,
  UPDATE_SLIDESHOW_TITLE_URL,
  SAVE_SLIDESHOW_URL,
  DELETE_SLIDE_URL,
} from "constants/urls";

import { generateSlideObject } from "utils/slider";

export const getSlideshow = slideshow_id => async (dispatch, getState) => {
  try {
    dispatch(setLoadingSlideshow(true));
    const res = await axiosSlidr.get(`${GET_SLIDESHOW_URL}/${slideshow_id}`);
    if (res.status && res?.data?.data) {
      dispatch(setLoadingSlideshow(false));
      dispatch(
        setSlideshow({ data: res.data.data, slideshow_id: slideshow_id })
      );
      if (res.data?.data?.slides) {
        const slides = res.data.data.slides
          .filter(slide => !!slide.content)
          .map(slide => generateSlideObject(slide.content, slide.slide_id))
          .filter(slide => !!slide);
        if (!!slides.length) {
          dispatch(setSlides(slides));
          dispatch(setActiveSlide(slides[0].id));
        } else {
          dispatch(addSlide(slideshow_id));
          const state = getState();
          if (state.slidr.slides.length) {
            dispatch(setActiveSlide(state.slidr.slides[0].id));
          }
        }
      }
    }
  } catch (err) {
    dispatch(setLoadingSlideshow(false));
    toast.error(err.response?.data?.message || err.message);
  }
};
export const videoField =
  ({ payload }) =>
  async dispatch => {
    try {
      const res = await getSlideId(payload.slideshow_id);
      if (res?.status && res.data.data.slide_id) {
        dispatch(
          setVideoField({ ...payload, slide_id: res.data.data.slide_id })
        );
        dispatch(setActiveSlide(res.data.data.slide_id));
        dispatch(saveSlideshow());
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };
export const getSlideId = async (slideshow_id, copy = 0) => {
  try {
    if (!copy) {
      store.dispatch(incrementCount());
    }
    const res = await axiosSlidr.post(`${ADD_SLIDE_URL}/${slideshow_id}`);
    if (res.status) {
      if (!copy) {
        store.dispatch(decrementCount());
      }
      return res;
    }
  } catch (err) {
    if (!copy) {
      store.dispatch(decrementCount());
    }
    toast.error(err.response?.data?.message || err.message);
  }
};
export const copySlide =
  ({ slide_id, slideshow_id }) =>
  async dispatch => {
    try {
      dispatch(setLoadingCopySlide({ slide_id: slide_id, status: true }));
      const res = await getSlideId(slideshow_id, 1);
      if (res?.status && res.data.data.slide_id) {
        dispatch(setLoadingCopySlide({ slide_id: 0, status: false }));
        dispatch(
          setCopySlide({
            copy_slide_id: slide_id,
            new_slide_id: res.data.data.slide_id,
          })
        );
        dispatch(saveSlideshow());
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };
export const addSlide =
  (slideshow_id, slide_id = 0) =>
  async dispatch => {
    try {
      const res = await getSlideId(slideshow_id);
      if (res?.status && res.data.data.slide_id) {
        dispatch(
          setAddSlide({ id: res.data.data.slide_id, slide_id: slide_id })
        );
        dispatch(saveSlideshow());
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };
export const deleteSlide =
  ({ slide_id, callBack }) =>
  async dispatch => {
    try {
      dispatch(setLoadingDeleteSlide(true));
      const res = await axiosSlidr.delete(`${DELETE_SLIDE_URL}/${slide_id}`);
      if (res.status) {
        toast.success(res.data.message);
        dispatch(setLoadingDeleteSlide(false));
        dispatch(setDeleteSlide(slide_id));
        callBack();
      }
    } catch (err) {
      dispatch(setLoadingDeleteSlide(false));
      toast.error(err.response?.data?.message || err.message);
    }
  };

export const saveSlideshow = clickSaveBtn => async (dispatch, getStore) => {
  try {
    const { slidr } = getStore();
    let payload = {};
    if (!!slidr?.slides) {
      payload = slidr.slides.map((slide, index) => ({
        slide_id: slide.id,
        content: generateSlideString(slide, slidr.settings.presentationSize),
        sort_order: index + 1,
        slide_type: !!slide.videoUrl ? 2 : 1,
        video_url: !!slide.videoUrl ? slide.videoUrl : "",
        video_type: !!slide.videoUrl ? getVideoType(slide.videoUrl) : 0,
      }));
    }
    dispatch(setLoadingSaveSlideshow(true));
    const res = await axiosSlidr.post(SAVE_SLIDESHOW_URL, {
      slides: payload,
      slideshow_id: slidr.slideshowId,
    });
    if (res.status) {
      dispatch(setLoadingSaveSlideshow(false));
      if (clickSaveBtn) {
        toast.success(res.data.message);
      }
    }
  } catch (err) {
    dispatch(setLoadingSaveSlideshow(false));
    toast.error(err.response?.data?.message || err.message);
  }
};
export const publishSlideshow =
  ({ slideshow_id, callBack }) =>
  async dispatch => {
    try {
      dispatch(setLoadingPublishSlideshow(true));
      const res = await axiosSlidr.put(PUBLISH_SLIDESHOW_URL, {
        slideshow_id: slideshow_id,
        published_url:
          process.env.REACT_APP_SLIDR_SITE_URL + "/slide-show/" + slideshow_id,
      });
      if (res.status) {
        dispatch(setLoadingPublishSlideshow(false));
        if (res.data?.data?.published_datetime) {
          dispatch(setPublishedDateTime(res.data.data.published_datetime));
        }
        toast.success(res.data.message);
        callBack();
      }
    } catch (err) {
      dispatch(setLoadingPublishSlideshow(false));
      toast.error(err.response?.data?.message || err.message);
    }
  };
export const slideSettings =
  ({ payload }) =>
  async dispatch => {
    let {
      autoSlide,
      slideNumbers,
      repeat,
      size,
      position,
      repeatSlideshow,
      grids,
      presentationSize,
      color,
      img,
      id,
      title,
    } = payload;
    try {
      let apiPayload = {
        title: title,
        slideshow_setting_id: id,
        auto_slide: autoSlide,
        show_slide_no: slideNumbers ? 1 : 0,
        background_repeat: repeat,
        background_all: size,
        background_position: position,
        slideshow_repeat: repeatSlideshow ? 1 : 0,
        slideshow_gridlines: grids ? 1 : 0,
        presentation_size: presentationSize === 1 ? "1280*720" : "960*720",
        background_color: color ? rgbaToHexA(color) : "",
        background_image: img,
      };
      dispatch(setLoadingSlideSettings(true));
      const res = await axiosSlidr.put(SET_SETTINGS_URL, apiPayload);
      if (res.status) {
        dispatch(setLoadingSlideSettings(false));
        dispatch(setSlideSettings(payload));
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

export const slideShowTitle = payload => async dispatch => {
  try {
    axiosSlidr.put(UPDATE_SLIDESHOW_TITLE_URL, payload);
  } catch (err) {
    toast.error(err.response?.data?.message || err.message);
  }
};

export const setActiveSlide = data => ({
  type: SET_ACTIVE_SLIDE,
  payload: data,
});

export const setAddSlide = data => ({
  type: SET_SLIDE,
  payload: data,
});

export const setDeleteSlide = data => ({
  type: SET_DELETE_SLIDE,
  payload: data,
});

export const setSlides = data => ({
  type: SET_SLIDES,
  payload: data,
});

export const setActiveField = data => ({
  type: SET_ACTIVE_FIELD,
  payload: data,
});

export const setTextFieldValue = data => ({
  type: SET_TEXT_FIELD_VALUE,
  payload: data,
});
export const textFieldDelete = () => ({
  type: SET_TEXT_FIELD_DELETE,
});
export const textFieldCopy = () => ({
  type: SET_TEXT_FIELD_COPY,
});

export const addText = () => ({
  type: ADD_TEXT,
});

export const addImage = data => ({
  type: ADD_IMAGE,
  payload: data,
});

export const setImageFieldValue = data => ({
  type: SET_IMAGE_FIELD_VALUE,
  payload: data,
});

export const setIsImageSelect = data => ({
  type: SET_IS_IMAGE_SELECT,
  payload: data,
});
export const setVideoField = data => ({
  type: SET_VIDEO_FIELD,
  payload: data,
});

export const setBackgroundField = data => ({
  type: SET_BACKGROUND_FIELD,
  payload: data,
});

export const setModalPreview = data => ({
  type: SET_MODAL_PREVIEW,
  payload: data,
});

export const setSlideSettings = data => ({
  type: SET_SLIDE_SETTINGS,
  payload: data,
});
export const setLoadingSlideSettings = data => ({
  type: SET_LOADING_SLIDE_SETTINGS,
  payload: data,
});

export const setGlobalCopyField = data => ({
  type: SET_GLOBAL_COPY_FIELD,
  payload: data,
});

export const setGlobalPasteField = data => ({
  type: SET_GLOBAL_PASTE_FIELD,
  payload: data,
});

export const slidesChange = data => ({
  type: SLIDR_SLIDES_CHANGE,
  payload: data,
});
export const actionUndo = () => ({
  type: SLIDR_ACTION_UNDO,
});
export const actionRedo = () => ({
  type: SLIDR_ACTION_REDO,
});
export const setSlideshow = data => ({
  type: SET_SLIDESHOW,
  payload: data,
});
export const setLoadingPublishSlideshow = data => ({
  type: SET_LOADING_PUBLISH_SLIDESHOW,
  payload: data,
});
export const setPublishedDateTime = data => ({
  type: SET_PUBLISHED_DATE_TIME,
  payload: data,
});

export const clearSlidesState = () => ({
  type: CLEAR_SLIDES_STATE,
});
export const setLoadingDeleteSlide = data => ({
  type: SET_LOADING_DELETE_SLIDE,
  payload: data,
});
export const setCopySlide = data => ({
  type: SET_COPY_SLIDE,
  payload: data,
});
export const setLoadingCopySlide = data => ({
  type: SET_LOADING_COPY_SLIDE,
  payload: data,
});
export const setLoadingSaveSlideshow = data => ({
  type: SET_LOADING_SAVE_SLIDESHOW,
  payload: data,
});

export const incrementCount = () => ({
  type: INCREMENT_COUNT,
});
export const decrementCount = () => ({
  type: DECREMENT_COUNT,
});
export const setLoadingSlideshow = data => ({
  type: LOADING_GET_SLIDESHOW,
  payload: data,
});
