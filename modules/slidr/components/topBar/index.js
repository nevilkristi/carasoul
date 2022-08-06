import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import Tour from "reactour";
import AddImageModal from "modules/slidr/components/topBar/components/AddImageModal";
import AddVideoModal from "modules/slidr/components/topBar/components/AddVideoModal";
import SlideBackgroundSettingsModal from "modules/slidr/components/topBar/components/SlideBackgroundSettingsModal";
import SlideshowSettingsModal from "modules/slidr/components/topBar/components/SlideshowSettingsModal";
import ConfirmPublishModal from "modules/slidr/components/topBar/components/ConfirmPublishModal";
import {
  addSlide,
  addText,
  setSlideSettings,
  actionRedo,
  actionUndo,
  textFieldDelete,
  setGlobalCopyField,
  setGlobalPasteField,
  setActiveSlide,
  slidesChange,
  publishSlideshow,
  slideShowTitle,
  saveSlideshow,
  clearSlidesState,
  setIntroductionTour,
  setActiveField,
} from "store/actions";
import { useDispatch, useSelector } from "react-redux";
import CommonButton from "common/Button";
import { useHistory } from "react-router-dom";
import useDebounce from "hooks/useDebounce";

import { toast } from "react-toastify";

import Alert from "common/Alert";

import { UncontrolledTooltip } from "reactstrap";
import moment from "moment";
import { handleDownloadZip } from "utils";

const getOS = () => {
  let userAgent = window.navigator.userAgent,
    platform = window.navigator.platform,
    macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
    windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
    iosPlatforms = ["iPhone", "iPad", "iPod"],
    os = null;
  if (macosPlatforms.indexOf(platform) !== -1) {
    os = "Mac OS";
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = "iOS";
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = "Windows";
  } else if (/Android/.test(userAgent)) {
    os = "Android";
  } else if (!os && /Linux/.test(platform)) {
    os = "Linux";
  }
  return os;
};

let action = "";

const Settings = ({ slideshow_id }) => {
  const imageRef = useRef();
  const videoRef = useRef();
  const backgroundRef = useRef();
  const slideshowSettingsRef = useRef();
  const history = useHistory();

  const {
    settings,
    slides,
    activeSlide,
    imageSelect,
    copy,
    activeField,
    stack: { undo, redo },
    loadingSaveSlideshow,
  } = useSelector(state => state.slidr);

  const { tour } = useSelector(state => state.profile);

  const isVideoSlide = useMemo(
    () => slides.find(slide => slide?.id === activeSlide)?.videoUrl,
    [slides, activeSlide]
  );

  const [showInput, setShowInput] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenConfirmPublishModal, setIsOpenConfirmPublishModal] =
    useState(false);
  const isPublished = !!settings.published_date_time;

  const dispatch = useDispatch();

  const debouncedSlides = useDebounce(slides, 500);
  const debouncedSave = useDebounce(slides, 2000);

  const finalSave = useCallback(
    clickSaveBtn => {
      dispatch(saveSlideshow(clickSaveBtn));
    },
    [slides, dispatch, slideshow_id, settings]
  );

  useEffect(() => {
    return () => {
      dispatch(clearSlidesState());
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(setActiveField(""));
  }, [activeSlide, dispatch]);

  useEffect(() => {
    if (!!debouncedSave && Array.isArray(debouncedSave)) {
      finalSave();
    }
  }, [debouncedSave]);

  useEffect(() => {
    if (!!debouncedSlides && Array.isArray(debouncedSlides)) {
      if (!["undo", "redo"].includes(action))
        dispatch(slidesChange(debouncedSlides));
      else action = "";
    }
  }, [debouncedSlides, dispatch]);

  useEffect(() => {
    const OS = getOS();
    const allowedOS = ["Mac OS", "Windows", "Linux"];
    const mainKey = OS === "Mac OS" ? "metaKey" : "ctrlKey";
    const keydownListener = e => {
      if (e.keyCode === 46 && !!activeField) {
        dispatch(textFieldDelete());
      }
      if (e[mainKey] && e.keyCode === 67 && !!activeField) {
        const slide = slides.find(slide => slide.id === activeSlide);
        if (!!slide) {
          const field = slide[imageSelect ? "imageFields" : "textFields"].find(
            item => item.id === activeField
          );
          if (!!field) {
            dispatch(
              setGlobalCopyField({
                imageSelect,
                field,
              })
            );
            toast.success("Copied!");
          }
        }
      }
      if (e[mainKey] && e.keyCode === 86 && !!copy && !!copy.field) {
        if (isVideoSlide) {
          setIsOpen(true);
        } else {
          dispatch(setGlobalPasteField());
        }
      }
      // Down Key
      if (e.keyCode === 40) {
        e.preventDefault();
        const nextSlideIndex =
          slides.findIndex(slide => slide.id === activeSlide) + 1;
        if (nextSlideIndex >= 0 && slides.length > nextSlideIndex) {
          const newSlideId = slides[nextSlideIndex]?.id;
          if (!!newSlideId) {
            dispatch(setActiveSlide(newSlideId));
          }
        }
      }
      // Up Key
      if (e.keyCode === 38) {
        e.preventDefault();
        const prevSlideIndex =
          slides.findIndex(slide => slide.id === activeSlide) - 1;
        if (prevSlideIndex >= 0) {
          const newSlideId = slides[prevSlideIndex]?.id;
          if (!!newSlideId) {
            dispatch(setActiveSlide(newSlideId));
          }
        }
      }
      // Undo

      if (e[mainKey] && e.keyCode === 90 && !e.shiftKey && undo.length > 1) {
        action = "undo";
        dispatch(actionUndo());
      }

      // Redo

      if (
        (e.metaKey &&
          e.shiftKey &&
          e.keyCode === 90 &&
          !!redo.length &&
          OS === "Mac OS") ||
        (e.ctrlKey &&
          e.keyCode === 89 &&
          !!redo.length &&
          ["Windows", "Linux"].includes(OS))
      ) {
        action = "redo";
        dispatch(actionRedo());
      }
    };
    if (allowedOS.includes(OS))
      window.addEventListener("keydown", keydownListener);
    return () => {
      if (allowedOS.includes(OS))
        window.removeEventListener("keydown", keydownListener);
    };
  }, [
    activeField,
    activeSlide,
    imageSelect,
    slides,
    dispatch,
    copy,
    undo,
    redo,
    isVideoSlide,
  ]);

  const handleUndo = () => {
    action = "undo";
    dispatch(actionUndo());
  };
  const handleRedo = () => {
    action = "redo";
    dispatch(actionRedo());
  };

  const handleAddSlide = () => {
    dispatch(addSlide(slideshow_id));
  };

  const handleAddText = () => {
    if (isVideoSlide) {
      setIsOpen(true);
    } else {
      dispatch(addText());
    }
  };

  const handleAddImage = () => {
    if (isVideoSlide) {
      setIsOpen(true);
    } else {
      imageRef.current.open();
    }
  };
  const handleAddVideo = () => {
    videoRef.current.open();
  };
  const handleAddBackground = () => {
    if (isVideoSlide) {
      setIsOpen(true);
    } else {
      backgroundRef.current.open();
    }
  };
  const handleSlideShowSettings = () => {
    slideshowSettingsRef.current.open();
  };

  const doubleClick = () => {
    setShowInput(true);
  };

  const publish = () => {
    dispatch(
      publishSlideshow({
        slideshow_id: +slideshow_id,
        callBack: () => setIsOpenConfirmPublishModal(false),
      })
    );
  };

  const steps = [
    {
      selector: "#add-text",
      content: () => <p className="mt-3">You can add text by clicking here.</p>,
    },
    {
      selector: "#add-image",
      content: () => (
        <p className="mt-3">You can add image by clicking here.</p>
      ),
    },
    {
      selector: "#add-video",
      content: () => (
        <p className="mt-3">You can add video by clicking here.</p>
      ),
    },
    {
      selector: "#add-background",
      content: () => (
        <p className="mt-3">You can add background by clicking here.</p>
      ),
    },
    {
      selector: "#manage-slideshow-settings",
      content: () => (
        <p className="mt-3">You can manage slide settings by clicking here.</p>
      ),
    },
    {
      selector: "#undo",
      content: () => <p className="mt-3">You can undo by clicking here.</p>,
    },
    {
      selector: "#redo",
      content: () => <p className="mt-3">You can redo by clicking here.</p>,
    },
    {
      selector: "#add-slide",
      content: () => (
        <p className="mt-3">You can add slide by clicking here.</p>
      ),
    },
    {
      selector: "#preview",
      content: () => (
        <p className="mt-3">You can preview presentation by clicking here.</p>
      ),
    },
    {
      selector: "#save",
      content: () => (
        <p className="mt-3">You can save presentation by clicking here.</p>
      ),
    },
    {
      selector: "#export-slideshow",
      content: () => (
        <p className="mt-3">You can save slides as images by clicking here.</p>
      ),
    },
    {
      selector: "#publish-slideshow",
      content: () => (
        <p className="mt-3">You can publish presentation by clicking here.</p>
      ),
    },
  ];

  const handleExport = () => {
    if (!isPublished) {
      setShowAlert(true);
      return;
    }
    const fileTitle = settings.title;
    setLoadingExport(true);
    handleDownloadZip(
      fileTitle,
      slideshow_id,
      (_, err) => {
        setLoadingExport(false);
        setExportProgress(0);
        if (!!err) {
          toast.error(err);
          return;
        }
      },
      percent => {
        setExportProgress(percent);
      }
    );
  };

  return (
    <>
      <Tour
        steps={steps}
        isOpen={tour.slidr}
        onRequestClose={() => {
          dispatch(setIntroductionTour({ slidr: false }));
        }}
        accentColor="#33bfd7"
        rounded={15}
        startAt={0}
        disableInteraction
      />
      <AddImageModal ref={imageRef} />
      <AddVideoModal ref={videoRef} slideshow_id={slideshow_id} />
      <SlideBackgroundSettingsModal ref={backgroundRef} />
      <SlideshowSettingsModal ref={slideshowSettingsRef} />
      <ConfirmPublishModal
        isOpen={isOpenConfirmPublishModal}
        confirm={publish}
        onClose={() => setIsOpenConfirmPublishModal(false)}
      />
      <Alert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        alertHeaderText="Oops!"
        alertDescriptionText="Please publish this Slideshow before you export the slides."
        confirmBtn={false}
      />
      <div className="tool" onClick={() => setShowInput(false)}>
        <div className="tool-item">
          <div className="back-arrow-title">
            <span
              className="back-arrow back-arrow-canvas"
              onClick={() => history.push("/")}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </span>
            <div>
              <div
                className="slide-title canvas-title"
                title="Double click to edit Slideshow title"
              >
                {showInput ? (
                  <input
                    onClick={e => e.stopPropagation()}
                    type="text"
                    value={settings.title}
                    className="form-control"
                    onChange={e => {
                      dispatch(
                        setSlideSettings({
                          ...settings,
                          title: e.target.value,
                        })
                      );
                    }}
                    onBlur={e => {
                      dispatch(
                        setSlideSettings({
                          ...settings,
                          title: e.target.value
                            ? e.target.value
                            : "Untitled Slideshow",
                        })
                      );
                      dispatch(
                        slideShowTitle({
                          slideshow_id: slideshow_id,
                          title: e.target.value
                            ? e.target.value
                            : "Untitled Slideshow",
                        })
                      );
                    }}
                  ></input>
                ) : (
                  <h2 onDoubleClick={doubleClick} className="mb-0">
                    {settings.title}
                  </h2>
                )}
              </div>
            </div>
          </div>
          <div className="feedbtn c-flex feedbtn-canvas">
            <CommonButton
              btnId="preview"
              btnText="Preview"
              btnClass="ms-2"
              btnRounded={false}
              btnOutline={true}
              btnClick={() => {
                window.open(`/slide-show-preview/${slideshow_id}`);
              }}
            />
            <CommonButton
              btnId="save"
              btnText={loadingSaveSlideshow ? "Saving..." : "Save"}
              btnClass="ms-2"
              btnClick={() => finalSave(true)}
              btnRounded={false}
              btnOutline={true}
              btnDisabled={loadingSaveSlideshow}
            />
            {settings.published_date_time && (
              <CommonButton
                btnId="export-slideshow"
                btnText={
                  loadingExport
                    ? `Exporting...${
                        exportProgress > 0
                          ? ` (${exportProgress.toFixed(0)}%)`
                          : ""
                      }`
                    : "Export"
                }
                btnClick={handleExport}
                btnRounded={false}
                btnDisabled={loadingExport}
                btnOutline={true}
                btnClass="ms-2"
              />
            )}
            <CommonButton
              btnId="publish-slideshow"
              btnText="Publish"
              btnClick={() => setIsOpenConfirmPublishModal(true)}
              btnRounded={false}
              btnClass="ms-2"
            />
            {settings.published_date_time && (
              <UncontrolledTooltip
                target="publish-slideshow"
                placement="bottom"
              >
                {"Last published at " +
                  moment(settings.published_date_time).format(
                    "MM/DD/YYYY hh:mm A"
                  )}
              </UncontrolledTooltip>
            )}
          </div>
        </div>
      </div>
      <div className="tool2">
        <div className="tool-item">
          <div className="">
            <ul className="slide-icon">
              <li
                id="undo"
                className={`undoRedioBtn no-undo-radio ${
                  undo.length <= 1 ? "disabled" : ""
                }`}
                onClick={undo.length > 1 ? handleUndo : () => {}}
              >
                <span className="undo" title="undo">
                  <i className="bx bx-undo" /> Undo
                </span>
              </li>
              <li
                id="redo"
                className={`undoRedioBtn no-undo-radio ${
                  redo.length === 0 ? "disabled" : ""
                }`}
                onClick={redo.length === 0 ? () => {} : handleRedo}
              >
                <span className="undo" title="undo">
                  <i className="bx bx-redo" /> Redo
                </span>
              </li>
              <li
                id="add-slide"
                className="add-a-slide"
                onClick={handleAddSlide}
              >
                <div className="add-icon">
                  <i className="fa-solid fa-plus"></i>
                </div>{" "}
                Add a Slide
              </li>
            </ul>
          </div>
          <div>
            <ul className="cust-center-menu-btn">
              <li
                id="add-text"
                className="tools-icon border-radius-left-top-bottom"
                onClick={handleAddText}
              >
                <i className="bx bx-text"></i> Add Text
              </li>
              <li
                id="add-image"
                className="tools-icon"
                onClick={handleAddImage}
              >
                <i className="fa-solid fa-image" /> Add Image
              </li>
              <li
                id="add-video"
                className="tools-icon"
                onClick={handleAddVideo}
              >
                <i className="fa fa-video"></i> Add Video
              </li>
              <li
                className="tools-icon border-radius-right-top-bottom"
                id="add-background"
                onClick={handleAddBackground}
              >
                <i className="fa-solid fa-image" /> Add Background
              </li>
            </ul>
          </div>
          <div className="settings">
            <CommonButton
              btnId="manage-slideshow-settings"
              btnClick={handleSlideShowSettings}
              btnRounded={false}
            >
              <i className="fa fa-gear"></i>
              <span>Slideshow Settings</span>
            </CommonButton>
          </div>
        </div>
      </div>
      <Alert
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        alertHeaderText="Warning"
        alertDescriptionText="You can't use any other tools on Video Slide"
        confirmBtn={false}
      />
    </>
  );
};

export default Settings;
