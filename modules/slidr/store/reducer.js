import { v4 as uuidV4 } from "uuid";
import clonedeep from "lodash.clonedeep";
import max from "lodash/max";
import hexRgb from "hex-rgb";

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
  SET_PUBLISHED_DATE_TIME,
  SET_LOADING_PUBLISH_SLIDESHOW,
  CLEAR_SLIDES_STATE,
  SET_LOADING_DELETE_SLIDE,
  SET_COPY_SLIDE,
  SET_LOADING_COPY_SLIDE,
  SET_LOADING_SAVE_SLIDESHOW,
  INCREMENT_COUNT,
  DECREMENT_COUNT,
  LOADING_GET_SLIDESHOW,
  SET_LOADING_SLIDE_SETTINGS,
} from "./actionTypes";

import {
  defaultDocumentTitle,
  defaultTextParameters,
  defaultImageParameters,
} from "constants/slidr";
import { rgbToObj } from "utils/slider";

const generateDefaultSlide = () => ({
  id: uuidV4(),
  textFields: [
    {
      id: uuidV4(),
      ...defaultTextParameters,
      fontSize: "85px",
      lineHeight: "125px",
      placeholder: "Add Title",
      width: "700px",
      height: "125px",
      zIndex: 1001,
      translate: { x: 290, y: 250 },
    },
    {
      id: uuidV4(),
      ...defaultTextParameters,
      fontSize: "38px",
      lineHeight: "55px",
      placeholder: "Add Subtitle",
      width: "700px",
      height: "55px",
      zIndex: 1002,
      translate: { x: 290, y: 380 },
    },
  ],
  imageFields: [],
  videoUrl: "",
  backgroundImage: "",
  backgroundColor: {
    r: "0",
    g: "0",
    b: "0",
    a: "0",
  },
  isBackgroundImage: false,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  grids: false,
  backgroundType: "",
  videoPreviewImageUrl: "",
});

const initialState = {
  isActive: false,
  slideshowId: 0,
  settings: {
    id: 0,
    title: defaultDocumentTitle,
    feedCode: "",
    presentationSize: 1,
    autoSlide: 0,
    isImage: false,
    img: "",
    size: "cover",
    position: "center",
    repeat: "no-repeat",
    repeatSlideshow: false,
    slideNumbers: false,
    grids: false,
    color: null,
    published_date_time: "",
  },
  slides: [],
  activeField: "",
  activeSlide: "",
  imageSelect: false,
  modalPreview: false,
  copy: {
    isImage: "",
    isField: "",
  },
  stack: {
    undo: [],
    redo: [],
  },
  loadingDeleteSlide: false,
  loadingCopySlide: false,
  loadingSaveSlideshow: false,
  loadingGetSlideshow: true,
  loadingPublishSlideshow: false,
  loadingSlideSettings: false,
  newSlides: 0,
};

const removeStyle = (htmlString, value, replaceWith = "") =>
  htmlString.replaceAll(
    RegExp(`\\b${value}\\s*:\\s*([^;]+?)\\s*(;|$)`, "gi"),
    replaceWith
  );

const hexToRgba = hex => {
  const rgba = hexRgb(hex);
  return {
    r: rgba.red,
    g: rgba.green,
    b: rgba.blue,
    a: rgba.alpha,
  };
};

const getNewZIndex = slide =>
  (max([
    ...slide.imageFields.map(i => i.zIndex),
    ...slide.textFields.map(i => i.zIndex),
  ]) || 1000) + 1;

const slidrReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case SET_ACTIVE_SLIDE:
      return {
        ...state,
        activeSlide: payload,
      };
    case SET_SLIDE:
      let addNewSlide = clonedeep(generateDefaultSlide());
      if (state.settings.img) {
        addNewSlide.backgroundType = "image";
        addNewSlide.backgroundImage = state.settings.img;
      } else {
        addNewSlide.backgroundType = "color";
        let color = state.settings.color;
        addNewSlide.backgroundColor = color;
      }
      addNewSlide.id = payload.id;
      if (payload.slide_id) {
        const addCurrentIndex = state.slides.findIndex(
          x => x.id === payload.slide_id
        );
        state.slides.splice(addCurrentIndex + 1, 0, addNewSlide);
      }
      return {
        ...state,
        slides: !payload.slide_id
          ? [...state.slides, addNewSlide]
          : state.slides,
        activeSlide: addNewSlide.id,
      };

    case SET_DELETE_SLIDE:
      const deleteSlides = clonedeep(state.slides);
      const deleteIndex = deleteSlides.findIndex(slide => slide.id === payload);
      return {
        ...state,
        slides: deleteSlides.filter(slide => slide.id !== payload),
        activeSlide:
          payload === state.activeSlide
            ? deleteIndex === 0
              ? deleteSlides[1].id
              : deleteSlides[deleteIndex - 1].id
            : state.activeSlide,
      };
    case SET_SLIDES:
      return {
        ...state,
        slides: payload,
      };
    case SET_ACTIVE_FIELD:
      return {
        ...state,
        activeField: payload,
      };

    case SET_TEXT_FIELD_VALUE:
      const fieldType =
        payload.isImage !== undefined && payload.isImage !== null
          ? payload.isImage
            ? "imageFields"
            : "textFields"
          : "";
      return {
        ...state,
        slides: state.slides.map(slide => {
          if (slide.id === state.activeSlide) {
            slide[
              !!fieldType
                ? fieldType
                : state.imageSelect
                ? "imageFields"
                : "textFields"
            ].map(field => {
              if (
                field.id === (!!payload.id ? payload.id : state.activeField)
              ) {
                if (
                  ["isBold", "isItalic", "isUnderline"].includes(payload.key)
                ) {
                  field.text = removeStyle(field.text, "font-weight");
                  field.text = removeStyle(field.text, "font-style");
                  field.text = removeStyle(field.text, "font-decoration");
                } else if (payload.key === "fontFamily") {
                  field.text = removeStyle(
                    field.text,
                    "font-family",
                    "font-family: inherit;"
                  );
                } else if (payload.key === "fontSize") {
                  field.text = removeStyle(field.text, "font-size");
                } else if (payload.key === "color") {
                  field.text = removeStyle(field.text, "color");
                } else if (payload.key === "textAlign") {
                  field.text = removeStyle(field.text, "text-align");
                } else if (payload.key === "lineHeight") {
                  field.text = removeStyle(field.text, "line-height");
                }
                field[payload.key] = payload.value;
              }
              return field;
            });
          }
          return slide;
        }),
      };
    case SET_TEXT_FIELD_DELETE:
      return {
        ...state,
        slides: state.slides.map(slide => {
          if (slide.id === state.activeSlide) {
            slide[state.imageSelect ? "imageFields" : "textFields"] = slide[
              state.imageSelect ? "imageFields" : "textFields"
            ].filter(textField => textField.id !== state.activeField);
          }
          return slide;
        }),
        activeField: "",
      };
    case SET_TEXT_FIELD_COPY:
      return {
        ...state,
        slides: state.slides.map(slide => {
          if (slide.id === state.activeSlide) {
            const activeTextField = slide[
              state.imageSelect ? "imageFields" : "textFields"
            ].find(textField => textField.id === state.activeField);
            slide[state.imageSelect ? "imageFields" : "textFields"] = [
              ...slide[state.imageSelect ? "imageFields" : "textFields"],
              clonedeep({ ...activeTextField, id: uuidV4() }),
            ];
          }
          return slide;
        }),
      };

    case ADD_TEXT:
      return {
        ...state,
        slides: state.slides.map(slide => {
          if (slide.id === state.activeSlide) {
            slide.textFields = [
              ...slide.textFields,
              {
                id: uuidV4(),
                ...defaultTextParameters,
                zIndex: getNewZIndex(slide),
              },
            ];
          }
          return slide;
        }),
      };

    case ADD_IMAGE:
      return {
        ...state,
        slides: state.slides.map(slide => {
          if (slide.id === state.activeSlide) {
            slide.imageFields = [
              ...slide.imageFields,
              {
                id: uuidV4(),
                ...defaultImageParameters,
                src: payload,
                zIndex: getNewZIndex(slide),
              },
            ];
          }
          return slide;
        }),
      };

    case SET_IS_IMAGE_SELECT:
      return {
        ...state,
        imageSelect: payload,
      };
    case SET_VIDEO_FIELD:
      const videoSlide = clonedeep(generateDefaultSlide());
      const currentIndexVideo = state.slides.findIndex(
        x => x.id === state.activeSlide
      );
      const addVideoSlide = {
        videoUrl: payload.videoUrl,
        videoPreviewImageUrl: payload.videoPreviewImageUrl,
        textFields: [],
        id: payload.slide_id,
        backgroundType: state.settings.isImage ? "image" : "color",
        ...(state.settings.isImage
          ? {
              backgroundImage: state.settings.img,
              backgroundPosition: state.settings.position,
              backgroundRepeat: state.settings.repeat,
              backgroundSize: state.settings.size,
            }
          : {
              backgroundColor: state.settings.color || {
                r: "0",
                g: "0",
                b: "0",
                a: "1",
              },
            }),
      };
      state.slides.splice(currentIndexVideo + 1, 0, addVideoSlide);
      return {
        ...state,
        slides: state.slides,
        activeSlide: videoSlide.id,
      };
    case SET_BACKGROUND_FIELD:
      return {
        ...state,
        slides: state.slides.map(slide => {
          if (slide.id === state.activeSlide) {
            slide.backgroundType = payload.isBackgroundImage
              ? "image"
              : "color";
            if (payload.isBackgroundImage) {
              slide.backgroundImage = payload.backgroundImage;
              slide.backgroundColor = "";
              slide.isBackgroundImage = payload.isBackgroundImage;
              slide.backgroundPosition = payload.backgroundPosition;
              slide.backgroundRepeat = payload.backgroundRepeat;
              slide.backgroundSize = payload.backgroundSize;
            } else {
              slide.backgroundColor = payload.backgroundColor;
              slide.backgroundImage = "";
              slide.backgroundPosition = "";
              slide.backgroundRepeat = "";
              slide.backgroundSize = "";
            }
          }
          return slide;
        }),
      };

    case SET_MODAL_PREVIEW:
      return {
        ...state,
        modalPreview: payload,
      };

    case SET_SLIDE_SETTINGS:
      const isBgValueChange = payload.isBgValueChange;
      delete payload.isBgValueChange;
      return {
        ...state,
        settings: {
          ...state.settings,
          ...payload,
          title: payload?.title,
        },
        ...(isBgValueChange
          ? {
              slides: state.slides.map(slide => {
                slide.backgroundColor = payload.color
                  ? payload.color
                  : slide.videoUrl
                  ? { r: "0", g: "0", b: "0", a: "1" }
                  : null;
                slide.backgroundImage = payload.img;
                slide.backgroundPosition = payload.position;
                slide.backgroundRepeat = payload.repeat;
                slide.backgroundSize = payload.size;
                slide.backgroundType = payload.isImage ? "image" : "color";
                return slide;
              }),
            }
          : {}),
      };
    case SET_LOADING_SLIDE_SETTINGS:
      return {
        ...state,
        loadingSlideSettings: payload,
      };
    case SET_GLOBAL_COPY_FIELD:
      return {
        ...state,
        copy: {
          isImage: payload.imageSelect,
          field: payload.field,
        },
      };
    case SET_GLOBAL_PASTE_FIELD:
      return {
        ...state,
        slides: state.slides.map(slide => {
          if (slide.id === state.activeSlide) {
            const field = clonedeep(state.copy.field);
            slide[state.copy.isImage ? "imageFields" : "textFields"] = [
              ...slide[state.copy.isImage ? "imageFields" : "textFields"],
              clonedeep({
                ...field,
                id: uuidV4(),
                zIndex: getNewZIndex(slide),
              }),
            ];
          }
          return slide;
        }),
      };

    case SLIDR_SLIDES_CHANGE:
      return {
        ...state,
        stack: {
          ...state.stack,
          undo: [...clonedeep(state.stack.undo), clonedeep(payload)],
          redo: state.stack.redo.length ? [] : clonedeep(state.stack.redo),
        },
      };

    case SLIDR_ACTION_UNDO:
      const newUndoState = clonedeep(state.stack.undo);
      const addToRedo = newUndoState.pop();
      const newSlides = newUndoState[newUndoState.length - 1];
      const activeSlideId = newSlides.find(
        slide => slide.id === state.activeSlide
      )?.id;

      return {
        ...state,
        stack: {
          ...state.stack,
          undo: clonedeep(newUndoState),
          redo: [clonedeep(addToRedo), ...clonedeep(state.stack.redo)],
        },
        slides: newSlides,
        activeSlide: !!activeSlideId
          ? activeSlideId
          : newSlides[newSlides.length - 1].id,
      };

    case SLIDR_ACTION_REDO:
      const newRedoState = clonedeep(state.stack.redo);
      const addToUndo = newRedoState.shift();
      return {
        ...state,
        stack: {
          ...state.stack,
          undo: [...clonedeep(state.stack.undo), clonedeep(addToUndo)],
          redo: clonedeep(newRedoState),
        },
        slides: clonedeep(addToUndo),
      };

    case SET_SLIDESHOW:
      const { slideShowSetting } = payload.data;
      return {
        ...state,
        slideshowId: payload.slideshow_id,
        settings: {
          id: slideShowSetting?.slideshow_setting_id || 0,
          title: slideShowSetting?.title || defaultDocumentTitle,
          feedCode: slideShowSetting?.feedCode || "",
          presentationSize:
            slideShowSetting?.presentation_size === "960*720" ? 2 : 1,
          autoSlide: slideShowSetting?.auto_slide || 0,
          isImage: slideShowSetting?.background_image ? true : false,
          img: slideShowSetting?.background_image || "",
          size: slideShowSetting?.background_all || "cover",
          position: slideShowSetting?.background_position || "center",
          repeat: slideShowSetting?.background_repeat || "no-repeat",
          repeatSlideshow: slideShowSetting?.slideshow_repeat ? true : false,
          slideNumbers: slideShowSetting?.show_slide_no ? true : false,
          grids: slideShowSetting?.slideshow_gridlines ? true : false,
          color: slideShowSetting?.background_color
            ? slideShowSetting.background_color.startsWith("rgb")
              ? rgbToObj(slideShowSetting.background_color)
              : hexToRgba(slideShowSetting.background_color)
            : null,
          published_date_time: slideShowSetting?.published_datetime || "",
        },
      };

    case SET_LOADING_PUBLISH_SLIDESHOW:
      return {
        ...state,
        loadingPublishSlideshow: payload,
      };
    case CLEAR_SLIDES_STATE:
      return {
        ...state,
        ...clonedeep(initialState),
      };
    case SET_LOADING_DELETE_SLIDE:
      return {
        ...state,
        loadingDeleteSlide: payload,
      };
    case SET_COPY_SLIDE:
      let copySlide = clonedeep(
        state.slides.find(slide => slide.id === payload.copy_slide_id)
      );
      copySlide.id = payload.new_slide_id;
      const currentIndex = state.slides.findIndex(
        slide => slide.id === payload.copy_slide_id
      );
      state.slides.splice(currentIndex + 1, 0, copySlide);
      return {
        ...state,
        slides: state.slides,
        activeSlide: copySlide.id,
      };
    case SET_LOADING_COPY_SLIDE:
      return {
        ...state,
        loadingCopySlide: payload,
      };
    case SET_LOADING_SAVE_SLIDESHOW:
      return {
        ...state,
        loadingSaveSlideshow: payload,
      };
    case INCREMENT_COUNT:
      return {
        ...state,
        newSlides: state.newSlides + 1,
      };
    case DECREMENT_COUNT:
      return {
        ...state,
        newSlides: state.newSlides - 1,
      };
    case SET_PUBLISHED_DATE_TIME:
      return {
        ...state,
        settings: {
          ...state.settings,
          published_date_time: payload,
        },
      };
    case LOADING_GET_SLIDESHOW:
      return {
        ...state,
        loadingGetSlideshow: payload,
      };
    default:
      return {
        ...state,
      };
  }
};

export default slidrReducer;
